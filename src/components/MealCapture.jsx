import { useState, useRef, useEffect } from 'react'
import { X, ZapOff, ScanLine, Image as ImageIcon, SlidersHorizontal, Flame, Leaf, ArrowRight, Loader2, Barcode } from 'lucide-react'
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

export default function MealCapture() {
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
                    const analysis = await analyzeMeal(mealRecord.id)
                    setAnalysisData(analysis)
                    setIsAnalyzing(false)
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

            try {
                // 1. Upload to Storage
                const imagePath = await uploadMealPhoto(user.id, file)

                // 2. Create DB Record
                const mealRecord = await createMealRecord(user.id, imagePath, {})
                setMealData(mealRecord)

                // 3. Move to simulated result
                setStatus('simulated_result')

                // 4. Edge Function Analysis
                const analysis = await analyzeMeal(mealRecord.id)
                setAnalysisData(analysis)

            } catch (error) {
                console.error("Capture failing", error)
                alert("Erreur lors de l'analyse du repas. Veuillez réessayer.")
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
        window.location.hash = ''
        window.location.reload()
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
            const analysis = await analyzeMeal(mealRecord.id)
            setAnalysisData(analysis)
        } catch (error) {
            console.error('Gallery upload error:', error)
            alert("Erreur lors de l'analyse. Veuillez réessayer.")
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
            <div className="relative z-10 flex justify-between items-center px-6 pt-12">
                <button onClick={closeCapture} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                    <X className="w-5 h-5" />
                </button>

                <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'scanning' ? 'bg-brand-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-white text-xs font-bold tracking-wide">
                        {status === 'scanning' ? 'Analyse globale en cours...' :
                            captureMode === 'barcode' ? 'Scanner un Code-Barres...' :
                                isModelLoading ? 'Initialisation AR...' : 'Vision AR Active'}
                    </span>
                </div>

                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white cursor-pointer" onClick={() => setCaptureMode(prev => prev === 'ar' ? 'barcode' : 'ar')}>
                    {captureMode === 'ar' ? <Barcode className="w-5 h-5" /> : <ScanLine className="w-5 h-5" />}
                </div>
            </div>

            {/* Scanning UI / Crosshairs */}
            {status === 'camera' && captureMode === 'ar' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-72 h-72 border-2 border-white/30 rounded-[2.5rem] relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-400 rounded-tl-[2rem]"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-400 rounded-tr-[2rem]"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-400 rounded-bl-[2rem]"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-400 rounded-br-[2rem]"></div>
                    </div>
                </div>
            )}

            {/* Active Scanning Animation */}
            {status === 'scanning' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-full h-1 bg-brand-400 shadow-[0_0_20px_10px_rgba(27,193,103,0.5)] animate-scan-line"></div>
                </div>
            )}

            {/* AR Overlays (Simulated Result) */}
            {status === 'simulated_result' && (
                <div className="absolute inset-0 pointer-events-none z-20 pt-32 pb-60 relative">

                    {/* Wait for analysis */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center animate-pulse border border-white/30">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                            <span className="text-white mt-4 font-bold tracking-wide animate-pulse">Eatly extrait la nutrition...</span>
                        </div>
                    )}

                    {/* Real AR Dots based on analysis */}
                    {!isAnalyzing && analysisData?.result?.components && (
                        <>
                            {analysisData.result.components.slice(0, 3).map((comp, idx) => {
                                const positions = [
                                    { top: '30%', left: '20%' },
                                    { top: '45%', right: '15%' },
                                    { bottom: '35%', left: '30%' }
                                ];
                                const pos = positions[idx % 3];
                                return (
                                    <div key={idx} className="absolute animate-in zoom-in slide-in-from-bottom-4 duration-500" style={{ ...pos, animationDelay: `${idx * 200}ms` }}>
                                        <div className="bg-white/20 backdrop-blur-xl border border-white/40 rounded-2xl p-2 pr-4 flex flex-col shadow-2xl relative">
                                            <div className={`absolute ${idx === 0 ? '-top-1.5 -left-1.5' : idx === 1 ? 'top-4 -left-1' : '-bottom-1 left-1/2 -ml-1.5'} w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]`}></div>
                                            <span className="text-[13px] font-bold text-white mb-0.5 flex items-center gap-1 capitalize">
                                                {comp.name} <div className="w-2 h-2 rounded-full bg-brand-400"></div>
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Bottom Summary Cards */}
                            <div className="absolute bottom-6 left-6 right-6 flex gap-3 animate-in fade-in slide-in-from-bottom-8 duration-700 pointer-events-auto">
                                <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#FF6B00]/20 rounded-full flex items-center justify-center">
                                        <Flame className="w-5 h-5 text-[#FF6B00]" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[17px] font-extrabold text-white leading-none mb-1">{analysisData.result?.macros?.calories || '?'}</span>
                                        <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wider">TOTAL KCAL</span>
                                    </div>
                                </div>
                                <div className="flex-1 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 flex items-center gap-4" onClick={viewFullAnalysis}>
                                    <div className="w-10 h-10 bg-brand-500/20 rounded-full flex items-center justify-center">
                                        <Leaf className="w-5 h-5 text-brand-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[17px] font-extrabold text-white leading-none mb-1">Score: {analysisData.result?.feel_score?.energy || '?'}</span>
                                        <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wider">ÉNERGIE</span>
                                    </div>
                                </div>
                            </div>

                            {/* Arrow to proceed */}
                            <button onClick={viewFullAnalysis} className="absolute bottom-32 right-6 w-14 h-14 bg-white text-foreground rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] pointer-events-auto active:scale-95 animate-in slide-in-from-right-8 duration-500 delay-500">
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Bottom Camera Controls */}
            {status === 'camera' && (
                <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-center z-20 pb-12">
                    <button onClick={() => galleryRef.current?.click()} className="w-14 h-14 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white active:scale-95">
                        <ImageIcon className="w-6 h-6" />
                        <input ref={galleryRef} type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                    </button>

                    {/* Main Capture Button */}
                    {captureMode === 'ar' ? (
                        <button
                            onClick={handleCapture}
                            disabled={isModelLoading}
                            className={`w-[84px] h-[84px] rounded-full flex items-center justify-center border-[4px] border-white/30 backdrop-blur-md transition-transform ${isModelLoading ? 'bg-white/5 opacity-50 cursor-not-allowed' : 'bg-white/10 active:scale-95'}`}
                        >
                            <div className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center shadow-inner">
                                {isModelLoading ? <Loader2 className="w-7 h-7 text-brand-400 stroke-[2.5px] animate-spin" /> : <ScanLine className="w-7 h-7 text-brand-600 stroke-[2.5px]" />}
                            </div>
                        </button>
                    ) : (
                        <div className="text-white backdrop-blur-md bg-white/10 px-6 py-3 rounded-full text-sm font-bold border border-white/20">
                            Recherche de Code-Barres...
                        </div>
                    )}

                    <button className="w-14 h-14 bg-transparent border border-white/10 rounded-full flex items-center justify-center text-white active:scale-95" onClick={() => setCaptureMode(prev => prev === 'ar' ? 'barcode' : 'ar')}>
                        <Barcode className="w-6 h-6" />
                    </button>
                </div>
            )}

        </div>
    )
}

