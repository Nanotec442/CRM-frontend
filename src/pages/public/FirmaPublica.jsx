import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader2, PenLine, Type } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import api from "../../services/api";

const FUENTES_FIRMA = [
    { nombre: "Dancing Script", css: "'Dancing Script', cursive" },
    { nombre: "Great Vibes", css: "'Great Vibes', cursive" },
    { nombre: "Pacifico", css: "'Pacifico', cursive" },
];

export default function FirmaPublica() {
    const { token } = useParams();
    const sigRef = useRef(null);
    const canvasTextoRef = useRef(null);

    const [estado, setEstado] = useState("cargando");
    const [mensaje, setMensaje] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [tab, setTab] = useState("dibujo"); // "dibujo" | "nombre"
    const [nombre, setNombre] = useState("");
    const [fuenteIdx] = useState(0);

    useEffect(() => {
        // Cargar fuentes cursivas de Google Fonts
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Pacifico&display=swap";
        document.head.appendChild(link);

        api.get(`/documentos/firma-publica/${token}`, { responseType: "blob" })
            .then((res) => {
                setPdfUrl(URL.createObjectURL(res.data));
                setEstado("listo");
            })
            .catch((err) => {
                setMensaje(err.response?.data?.detail || "Link inválido o expirado.");
                setEstado("error");
            });
    }, [token]);

    // Convertir nombre escrito a imagen base64 usando canvas
    const nombreABase64 = () => {
        const canvas = canvasTextoRef.current;
        if (!canvas) return null;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#1e293b";
        ctx.font = `52px ${FUENTES_FIRMA[fuenteIdx].css}`;
        ctx.textBaseline = "middle";
        ctx.fillText(nombre, 20, canvas.height / 2);
        return canvas.toDataURL("image/png");
    };

    const handleFirmar = async () => {
        let firma_base64 = null;

        if (tab === "dibujo") {
            if (!sigRef.current || sigRef.current.isEmpty()) {
                alert("Por favor dibuja tu firma antes de continuar.");
                return;
            }
            firma_base64 = sigRef.current.toDataURL("image/png");
        } else {
            if (!nombre.trim()) {
                alert("Por favor escribe tu nombre para firmar.");
                return;
            }
            firma_base64 = nombreABase64();
        }

        setEnviando(true);
        try {
            await api.post(`/documentos/firma-publica/${token}`, { firma_base64 });
            setEstado("firmado");
        } catch (err) {
            setMensaje(err.response?.data?.detail || "Error al firmar el documento.");
            setEstado("error");
        } finally {
            setEnviando(false);
        }
    };

    if (estado === "cargando") return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
        </div>
    );

    if (estado === "firmado") return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
            <CheckCircle size={56} className="text-emerald-500" />
            <h1 className="text-2xl font-bold text-slate-900">Documento firmado</h1>
            <p className="text-slate-600">Tu firma ha sido registrada correctamente. Puedes cerrar esta ventana.</p>
        </div>
    );

    if (estado === "error") return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
            <AlertCircle size={56} className="text-red-400" />
            <h1 className="text-2xl font-bold text-slate-900">Enlace no válido</h1>
            <p className="text-slate-600">{mensaje}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            <div className="max-w-2xl mx-auto space-y-6">

                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Revisión y firma de documento</h1>
                    <p className="text-slate-500 mt-1">Revisa el documento y elige cómo quieres firmarlo.</p>
                </div>

                {/* Visor PDF */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <iframe src={pdfUrl} className="w-full h-[480px]" title="Documento para firmar" />
                </div>

                {/* Panel de firma */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100">
                        <button
                            onClick={() => setTab("dibujo")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${tab === "dibujo"
                                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <PenLine size={15} />
                            Dibujar firma
                        </button>
                        <button
                            onClick={() => setTab("nombre")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${tab === "nombre"
                                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <Type size={15} />
                            Escribir nombre
                        </button>
                    </div>

                    <div className="p-6 space-y-4">

                        {/* Tab dibujo */}
                        {tab === "dibujo" && (
                            <>
                                <p className="text-sm text-slate-500">Dibuja tu firma con el mouse o dedo:</p>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                    <SignatureCanvas
                                        ref={sigRef}
                                        canvasProps={{ width: 560, height: 150, className: "w-full" }}
                                        backgroundColor="transparent"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => sigRef.current?.clear()}
                                        className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Tab nombre */}
                        {tab === "nombre" && (
                            <>
                                <p className="text-sm text-slate-500">
                                    Escribe tu nombre completo. Esto tendrá validez como firma electrónica.
                                </p>

                                <input
                                    type="text"
                                    placeholder="Tu nombre completo..."
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1.4rem" }}
                                />

                                {/* Canvas oculto para convertir el nombre a imagen */}
                                <canvas ref={canvasTextoRef} width={600} height={120} className="hidden" />
                            </>
                        )}


                        {/* Botón firmar */}
                        <div className="pt-2">
                            <button
                                onClick={handleFirmar}
                                disabled={enviando}
                                className="w-full py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
                            >
                                {enviando && <Loader2 size={15} className="animate-spin" />}
                                Firmar documento
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}