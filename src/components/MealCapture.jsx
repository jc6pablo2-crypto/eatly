import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Tag, ScanLine, Image as ImageIcon, SlidersHorizontal, Flame, Leaf, ArrowRight, Loader2, Barcode, AlertCircle } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { uploadMealPhoto, createMealRecord, analyzeMeal, getTodayMealCount } from '../lib/api'
import MealAnalysis from './MealAnalysis'
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { BrowserMultiFormatReader } from '@zxing/library'
import PremiumCTA from './PremiumCTA'

// Translations for common food items detected by coco-ssd
const DICTIONARY = {
    'apple': 'Pomme', 'banana': 'Banane', 'orange': 'Orange', 'broccoli': 'Brocoli',
    'carrot': 'Carotte', 'hot dog': 'Hot-dog', 'pizza': 'Pizza', 'donut': 'Donut', 'cake': 'Gâteau',
    'sandwich': 'Sandwich', 'bowl': 'Bol', 'cup': 'Tasse', 'bottle': 'Bouteille',
    'fork': 'Fourchette', 'knife': 'Couteau', 'spoon': 'Cuillère', 'wine glass': 'Verre de vin',
    'dining table': 'Table'
}

export default function MealCapture({ onClose }) {
    const { user, profile } = useAuth()
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const galleryRef = useRef(null)
    const [stream, setStream] = useState(null)
    const [capturedImage, setCapturedImage] = useState(null)
    const [status, setStatus] = useState('camera') // camera, scanning, simulated_result, analysis, limit_reached
    const [captureMode, setCaptureMode] = useState('ar') // 'ar' or 'barcode'

    const isPremium = profile?.is_premium

    // AI & AR State
    const [tfModel, setTfModel] = useState(null)
    const [isModelLoading, setIsModelLoading] = useState(true)
    const requestRef = useRef()
    const codeReaderRef = useRef(new BrowserMultiFormatReader())

    // API State
    const [mealData, setMealData] = useState(null)
    const [analysisData, setAnalysisData] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [captureError, setCaptureError] = useState(null)

    // Start Camera and Load TF Model on load
    useEffect(() => {
        const initAR = async () => {
            // Check limits for free users
            if (!isPremium && user) {
                try {
                    const count = await getTodayMealCount(user.id)
                    if (count >= 3) {
                        setStatus('limit_reached')
                        setIsModelLoading(false)
                        return // Do not start camera
                    }
                } catch (e) {
                    console.error("Could not fetch meal count limit", e)
                }
            }

            await startCamera()
            try {
                // Ensure WebGL backend for performance
                await tf.setBackend('webgl')
                await tf.ready()
                const loadedModel = await cocoSsd.load()
                setTfModel(loadedModel)
                setIsModelLoading(false)
            } catch (err) {
                console.error("TFJS load error:", err)
                setIsModelLoading(false) // Fallback to normal camera if TF fails
            }
        }
        initAR()
        return () => {
            stopCamera()
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
    }, [user, isPremium])

    // Start detection loop when camera and model are ready
    useEffect(() => {
        if (status === 'camera' && videoRef.current && videoRef.current.readyState === 4) {
            detectFrame()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tfModel, status, captureMode]) // Add captureMode to dependency array

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
                // Wait for video to be ready before starting detection
                videoRef.current.onloadeddata = () => {
                    if (status === 'camera') detectFrame()
                }
            }
        } catch (err) {
            console.error("Camera access denied or unavailable", err)
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
        if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }

    const detectFrame = async () => {
        if (!videoRef.current || !canvasRef.current || status !== 'camera') return

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        // Match canvas to video dimensions
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        if (captureMode === 'ar' && tfModel) {
            try {
                const predictions = await tfModel.detect(video)

                ctx.clearRect(0, 0, canvas.width, canvas.height)

                predictions.forEach(prediction => {
                    if (prediction.score > 0.5) {
                        const [x, y, width, height] = prediction.bbox

                        // Draw Glassmorphism bounding box
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
                        ctx.lineWidth = 3
                        ctx.lineJoin = 'round'

                        // Add a subtle glow
                        ctx.shadowColor = 'rgba(56, 187, 191, 0.8)' // Teal brand color
                        ctx.shadowBlur = 15
                        ctx.strokeRect(x, y, width, height)
                        ctx.shadowBlur = 0 // Reset

                        // Translate label
                        const englishName = prediction.class.toLowerCase()
                        const frenchName = DICTIONARY[englishName] || prediction.class

                        // Draw Label Background (Teal)
                        ctx.fillStyle = '#38BBBF'
                        const textWidth = ctx.measureText(frenchName).width
                        ctx.beginPath()
                        ctx.roundRect(x, y - 30, textWidth + 80, 30, [8, 8, 8, 8])
                        ctx.fill()

                        // Draw Label Text
                        ctx.fillStyle = '#FFFFFF'
                        ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif'
                        ctx.textAlign = 'left'
                        ctx.textBaseline = 'middle'
                        const conf = Math.round(prediction.score * 100)
                        ctx.fillText(`${frenchName.toUpperCase()} • ${conf}%`, x + 10, y - 15)
                    }
                })
            } catch (err) {
                // Ignore frame errors
            }
        } else if (captureMode === 'barcode') {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw Laser line
            const time = Date.now() / 1000
            const yLine = (canvas.height / 2) + Math.sin(time * 3) * 100
            ctx.strokeStyle = '#F9836B'
            ctx.lineWidth = 4
            ctx.shadowColor = 'rgba(249, 131, 107, 0.8)'
            ctx.shadowBlur = 15
            ctx.beginPath()
            ctx.moveTo(80, yLine)
            ctx.lineTo(canvas.width - 80, yLine)
            ctx.stroke()
            ctx.shadowBlur = 0

            // Draw Targeting Box
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
            ctx.lineWidth = 2
            ctx.strokeRect(60, (canvas.height / 2) - 120, canvas.width - 120, 240)

            // Attempt to decode barcode occasionally
            if (Math.random() < 0.25) { // ~25% of frames to save CPU
                try {
                    const result = await codeReaderRef.current.decodeFromVideoElement(video)
                    if (result && result.text) {
                        handleBarcodeScanned(result.text)
                        return // stop looping if found
                    }
                } catch (e) {
                    // Not found, continue
                }
            }
        }

        // Loop
        requestRef.current = requestAnimationFrame(detectFrame)
    }

    const handleBarcodeScanned = async (barcode) => {
        if (status !== 'camera') return

        setStatus('scanning')
        setIsAnalyzing(true)
        if (requestRef.current) cancelAnimationFrame(requestRef.current)

        try {
            const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`)
            const data = await res.json()

            if (data.status === 1 && data.product) {
                const product = data.product
                const context = {
                    type: 'barcode',
                    barcode: barcode,
                    product_name: product.product_name || "Produit Inconnu",
                    ingredients: product.ingredients_text || "Non spécifié",
                    additives: product.additives_tags || [],
                    nutriments: product.nutriments || {},
                    image_url: product.image_url || ""
                }

                // Snap photo
                const canvas = document.createElement('canvas')
                canvas.width = videoRef.current.videoWidth
                canvas.height = videoRef.current.videoHeight
                const ctx = canvas.getContext('2d')
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

                canvas.toBlob(async (blob) => {
                    const file = new File([blob], 'barcode.jpg', { type: 'image/jpeg' })
                    setCapturedImage(URL.createObjectURL(blob))
                    stopCamera()

                    const imagePath = await uploadMealPhoto(user.id, file)
                    const mealRecord = await createMealRecord(user.id, imagePath, context)
                    setMealData(mealRecord)

                    setStatus('simulated_result')
                    try {
                        const analysis = await analyzeMeal(mealRecord.id)
                        setAnalysisData(analysis)
                    } catch (aiError) {
                        console.error('[Eatly] Barcode AI Analysis failed:', aiError.message)
                        setCaptureError(`Analyse IA indisponible: ${aiError.message}`)
                    } finally {
                        setIsAnalyzing(false)
                    }
                }, 'image/jpeg', 0.8)
            } else {
                throw new Error("Produit non trouvé")
            }
        } catch (error) {
            alert("Erreur lors de la lecture du code-barres ou produit inconnu.")
            setStatus('camera')
            setIsAnalyzing(false)
            startCamera() // restart
        }
    }

    const handleCapture = () => {
        if (!videoRef.current) return
        if (captureMode === 'barcode') return // In barcode mode, scanning is automatic

        setStatus('scanning')
        setIsAnalyzing(true)
        if (requestRef.current) cancelAnimationFrame(requestRef.current)

        // Take snapshot from video feed
        const canvas = document.createElement('canvas')
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

        // Draw AR overly from canvasRef onto the snapshot as well, so the user sees what they scanned
        if (canvasRef.current) {
            ctx.drawImage(canvasRef.current, 0, 0, canvas.width, canvas.height)
        }

        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
            setCapturedImage(URL.createObjectURL(blob))
            stopCamera()
            setCaptureError(null)

            try {
                // Step 1: Upload photo to Supabase Storage
                console.log('[Eatly] Uploading photo...')
                const imagePath = await uploadMealPhoto(user.id, file)
                console.log('[Eatly] Upload OK:', imagePath)

                // Step 2: Create DB record
                console.log('[Eatly] Creating meal record...')
                const mealRecord = await createMealRecord(user.id, imagePath, {})
                setMealData(mealRecord)
                console.log('[Eatly] Meal record created:', mealRecord.id)

                // Step 3: Move to simulated result (photo saved successfully)
                setStatus('simulated_result')

                // Step 4: AI Analysis (can fail gracefully)
                try {
                    console.log('[Eatly] Starting AI analysis...')
                    const analysis = await analyzeMeal(mealRecord.id)
                    setAnalysisData(analysis)
                    console.log('[Eatly] Analysis complete ✓')
                } catch (aiError) {
                    console.error('[Eatly] AI Analysis failed:', aiError.message)
                    setCaptureError(`Analyse IA indisponible: ${aiError.message}`)
                    // Meal is still saved, user can continue
                }

            } catch (error) {
                console.error('[Eatly] Capture pipeline failed:', error.message)
                setCaptureError(error.message)
                setStatus('camera')
                setCapturedImage(null)
                startCamera()
            } finally {
                setIsAnalyzing(false)
            }
        }, 'image/jpeg', 0.8)
    }

    // Go to final detailed analysis view
    const viewFullAnalysis = () => setStatus('analysis')

    // Go back to Dashboard
    const closeCapture = () => {
        stopCamera()
        if (onClose) {
            onClose()
        } else {
            window.location.hash = ''
            window.location.reload()
        }
    }

    // Handle gallery photo upload
    const handleGalleryUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setStatus('scanning')
        setIsAnalyzing(true)
        if (requestRef.current) cancelAnimationFrame(requestRef.current)
        setCapturedImage(URL.createObjectURL(file))
        stopCamera()

        try {
            const imagePath = await uploadMealPhoto(user.id, file)
            const mealRecord = await createMealRecord(user.id, imagePath, {})
            setMealData(mealRecord)
            setStatus('simulated_result')

            try {
                const analysis = await analyzeMeal(mealRecord.id)
                setAnalysisData(analysis)
            } catch (aiError) {
                console.error('[Eatly] AI Analysis failed (Gallery):', aiError.message)
                setCaptureError(`Analyse IA indisponible: ${aiError.message}`)
            }
        } catch (error) {
            console.error('Gallery upload error:', error)
            setCaptureError(error.message)
            setStatus('camera')
            setCapturedImage(null)
            startCamera()
        } finally {
            setIsAnalyzing(false)
        }
    }

    if (status === 'analysis' && analysisData) {
        return <MealAnalysis image={capturedImage} meal={mealData} analysis={analysisData} onClose={closeCapture} />
    }

    if (status === 'limit_reached') {
        return (
            <div className="fixed inset-0 z-[100] bg-[#F7F9FA] flex flex-col pt-safe">
                <div className="relative z-10 flex justify-between items-center px-6 pt-12 pb-6">
                    <button onClick={closeCapture} className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-foreground active:scale-95">
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="font-bold text-lg text-foreground">Limite Atteinte</h2>
                    <div className="w-10 h-10"></div>
                </div>
                <div className="flex-1 px-6 flex flex-col justify-center pb-20">
                    <PremiumCTA
                        title="3 repas par jour max"
                        description="Débloquez les scans illimités, l'historique complet et l'IA avancée en devenant membre Platine."
                        variant="box"
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col">
            {/* Camera Feed or Captured Image */}
            <div className="absolute inset-0 w-full h-full object-cover">
                {status === 'camera' && (
                    <>
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-[3rem]" />
                        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover rounded-[3rem]" />
                    </>
                )}
                {(status === 'scanning' || status === 'simulated_result') && capturedImage && (
                    <img src={capturedImage} alt="Captured meal" className="w-full h-full object-cover rounded-[3rem]" />
                )}
                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 rounded-[3rem] pointer-events-none"></div>
            </div>

            {/* Top Bar */}
            <div className="relative z-10 flex items-center px-6 pt-14">
                <button onClick={closeCapture} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-800 shadow-md z-20 active:scale-95">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="absolute inset-0 pt-14 flex justify-center pointer-events-none">
                    <span className="text-white text-[20px] font-medium tracking-wide drop-shadow-md">
                        {status === 'scanning' ? 'Analysing food...' : 'Scanner'}
                    </span>
                </div>
            </div>

            {/* Viewfinder Brackets */}
            {status === 'camera' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 -mt-10">
                    <div className="w-[88vw] h-[55vh] max-h-[450px] relative">
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-white rounded-tl-[1.8rem]"></div>
                        <div className="absolute top-0 right-0 w-12 h-12 border-t-[3px] border-r-[3px] border-white rounded-tr-[1.8rem]"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[3px] border-l-[3px] border-white rounded-bl-[1.8rem]"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-white rounded-br-[1.8rem]"></div>

                        {/* Scanning Line overlay when active */}
                        {status === 'scanning' && (
                            <div className="absolute inset-0 overflow-hidden rounded-[1.8rem]">
                                <div className="w-full h-[30%] bg-gradient-to-b from-transparent to-[#4ADE80]/40 border-b-2 border-[#4ADE80] animate-scan-bounce"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}



            {/* AR Overlays (Simulated Result) */}
            {status === 'simulated_result' && (
                <div className="absolute inset-0 pointer-events-none z-20 pt-32 pb-60 relative">

                    {/* Wait for analysis or show error */}
                    {isAnalyzing && !captureError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center animate-pulse border border-white/30">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                            <span className="text-white mt-4 font-bold tracking-wide animate-pulse">Eatly extrait la nutrition...</span>
                        </div>
                    )}

                    {/* Show error banner if analysis failed but meal saved */}
                    {captureError && status === 'simulated_result' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto px-6">
                            <div className="w-full bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 shadow-2xl border border-red-100 animate-in slide-in-from-bottom duration-300">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-foreground font-extrabold text-xl mb-2">Erreur d'analyse</h3>
                                    <p className="text-gray-500 text-sm font-medium mb-6">
                                        La photo a été sauvegardée, mais l'analyse IA n'a pas pu aboutir.<br />
                                        <span className="text-xs text-gray-400 mt-2 block break-all">{captureError}</span>
                                    </p>
                                    <button
                                        onClick={viewFullAnalysis}
                                        className="w-full py-4 text-center rounded-[1.25rem] bg-foreground text-white font-extrabold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
                                    >
                                        Continuer sans analyse <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Result Bottom Sheet */}
                    {!isAnalyzing && analysisData?.result && (
                        <>
                            {/* Point focal sur l'aliment (Optionnel, petit repère visuel) */}
                            <div className="absolute top-[30%] left-1/2 -ml-3 w-6 h-6 bg-white/30 backdrop-blur-md border border-white rounded-full flex items-center justify-center animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-white shadow-lg"></div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] px-6 pt-8 pb-safe z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom duration-500 pointer-events-auto">

                                <h2 className="text-[26px] font-extrabold text-gray-900 mb-5 tracking-tight capitalize">
                                    {analysisData.result?.components?.[0]?.name || "Repas scanné"}
                                </h2>

                                {/* Total Kcal Bar */}
                                <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center mb-4 border border-gray-100">
                                    <span className="text-[17px] font-bold text-gray-800 tracking-tight">Total {analysisData.result?.macros?.calories || 0} Kcal</span>
                                    <div className="w-10 h-10 bg-[#00A3FF] rounded-full flex items-center justify-center shadow-md shadow-[#00A3FF]/30">
                                        <Flame className="w-5 h-5 text-white" />
                                    </div>
                                </div>

                                {/* 3 Macros Cards */}
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <div className="bg-orange-50/50 rounded-2xl py-4 flex flex-col items-center justify-center border border-orange-100">
                                        <span className="text-xl mb-1">🥖</span>
                                        <span className="text-[15px] font-extrabold text-gray-900">{analysisData.result?.macros?.carbs_g || 0}g</span>
                                        <span className="text-[11px] font-bold text-gray-500">Glucides</span>
                                    </div>
                                    <div className="bg-blue-50/50 rounded-2xl py-4 flex flex-col items-center justify-center border border-blue-100">
                                        <span className="text-xl mb-1">🍗</span>
                                        <span className="text-[15px] font-extrabold text-gray-900">{analysisData.result?.macros?.protein_g || 0}g</span>
                                        <span className="text-[11px] font-bold text-gray-500">Protéines</span>
                                    </div>
                                    <div className="bg-green-50/50 rounded-2xl py-4 flex flex-col items-center justify-center border border-green-100">
                                        <span className="text-xl mb-1">🥑</span>
                                        <span className="text-[15px] font-extrabold text-gray-900">{analysisData.result?.macros?.fat_g || 0}g</span>
                                        <span className="text-[11px] font-bold text-gray-500">Lipides</span>
                                    </div>
                                </div>

                                {/* Healthy Score Segmented Bar */}
                                <div className="mb-7">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[13px] font-semibold text-gray-500">Score Santé</span>
                                        <span className="text-[13px] font-extrabold text-gray-900">{analysisData.result?.feel_score?.energy || Math.floor(Math.random() * 20 + 80)}/100</span>
                                    </div>
                                    <div className="flex gap-1.5 h-3">
                                        <div className="flex-1 rounded-l-full bg-orange-400"></div>
                                        <div className="flex-[2] bg-[#00A3FF]"></div>
                                        <div className="flex-1 rounded-r-full bg-[#82D917] relative flex items-center">
                                            <div className="absolute right-2 w-4 h-4 rounded-full bg-black border-2 border-white shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pb-8">
                                    <button onClick={viewFullAnalysis} className="flex-1 py-4 bg-gray-50 text-gray-800 font-extrabold rounded-[1.25rem] active:scale-95 transition-transform text-[15px]">
                                        Détails complets
                                    </button>
                                    <button onClick={closeCapture} className="flex-1 py-4 bg-black text-white font-extrabold rounded-[1.25rem] active:scale-95 transition-transform text-[15px] shadow-lg shadow-black/20">
                                        Enregistrer
                                    </button>
                                </div>

                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Bottom Camera Controls */}
            {status === 'camera' && (
                <div className="absolute bottom-0 left-0 right-0 z-20 pb-10 flex flex-col items-center">

                    {/* Horizontal Modes */}
                    <div className="w-full overflow-x-auto hide-scrollbar flex gap-3 px-6 pb-6 pt-4 drop-shadow-md snap-x">

                        <button onClick={() => setCaptureMode('ar')} className={`flex flex-col items-center justify-center gap-1.5 w-24 h-24 shrink-0 rounded-3xl transition-all border snap-center ${captureMode === 'ar' ? 'bg-white text-gray-800 border-transparent shadow-xl' : 'bg-white/10 backdrop-blur-md text-white border-white/20'}`}>
                            <Leaf className="w-7 h-7" />
                            <span className="text-[11px] font-bold">Scan Food</span>
                        </button>

                        <button onClick={() => setCaptureMode('barcode')} className={`flex flex-col items-center justify-center gap-1.5 w-24 h-24 shrink-0 rounded-3xl transition-all border snap-center ${captureMode === 'barcode' ? 'bg-[#7EAA55] text-white border-[#7EAA55] shadow-[0_8px_20px_rgba(126,170,85,0.4)]' : 'bg-[#7EAA55]/50 backdrop-blur-md text-white border-white/20'}`}>
                            <Barcode className="w-7 h-7" />
                            <span className="text-[11px] font-bold">Barcode</span>
                        </button>

                        <button onClick={() => setCaptureMode('label')} className={`flex flex-col items-center justify-center gap-1.5 w-24 h-24 shrink-0 rounded-3xl transition-all border snap-center ${captureMode === 'label' ? 'bg-white/40 text-white border-transparent shadow-xl backdrop-blur-xl' : 'bg-white/10 backdrop-blur-md text-white border-white/20'}`}>
                            <Tag className="w-7 h-7" />
                            <span className="text-[11px] font-bold">Food label</span>
                        </button>

                        <button onClick={() => galleryRef.current?.click()} className={`flex flex-col items-center justify-center gap-1.5 w-24 h-24 shrink-0 rounded-3xl transition-all border snap-center bg-[#C6A46A]/40 backdrop-blur-md text-white border-white/20 active:scale-95`}>
                            <ImageIcon className="w-7 h-7" />
                            <span className="text-[11px] font-bold">Library</span>
                            <input ref={galleryRef} type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                        </button>

                    </div>

                    {/* Camera Actions Row */}
                    <div className="w-full flex justify-between items-center px-10 pt-4">
                        <button onClick={() => galleryRef.current?.click()} className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white active:scale-95 border border-white/20 shadow-md">
                            <ImageIcon className="w-5 h-5" />
                        </button>

                        {/* Main Shutter */}
                        <button
                            onClick={handleCapture}
                            disabled={isModelLoading}
                            className={`w-[72px] h-[72px] rounded-full flex items-center justify-center border-[3px] border-white transition-transform ${isModelLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-90 scale-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]'}`}
                        >
                            <div className="w-[58px] h-[58px] bg-white rounded-full flex items-center justify-center">
                                {isModelLoading && <Loader2 className="w-6 h-6 text-gray-400 stroke-[2.5px] animate-spin" />}
                            </div>
                        </button>

                        <button className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white active:scale-95 border border-white/20 shadow-md pointer-events-none opacity-50">
                            <ZapOff className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

        </div>
    )
}

