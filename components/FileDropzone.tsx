"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File as FileIcon, Loader2, CheckCircle, AlertCircle, ArrowRight, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function FileDropzone() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "uploading" | "converting" | "success" | "error">("idle");
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [watermark, setWatermark] = useState("");
    const [showWatermarkInput, setShowWatermarkInput] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setStatus("idle");
            setDownloadUrl(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        },
        maxFiles: 1,
    });

    const handleConvert = async () => {
        if (!file) return;

        setStatus("converting");
        const formData = new FormData();
        formData.append("file", file);
        if (watermark.trim()) {
            formData.append("watermark", watermark.trim());
        }

        try {
            const res = await fetch("/api/convert", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Server error:", errorData);
                throw new Error(errorData.details || "Conversion failed");
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setStatus("success");
        } catch (e) {
            console.error(e);
            setStatus("error");
        }
    };

    return (
        <div className="w-full max-w-xl">
            <div
                {...getRootProps()}
                className={cn(
                    "relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300",
                    isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card/50 hover:border-primary/50 hover:bg-card/80",
                    (status === "success" || status === "converting") && "pointer-events-none opacity-50"
                )}
            >
                <input {...getInputProps()} />
                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center gap-4 p-8 text-center"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted shadow-inner">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-semibold">Drop your Word file here</p>
                                <p className="text-sm text-muted-foreground">
                                    or click to browse (only .docx)
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="file"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center gap-6 p-8"
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                                <FileIcon className="h-10 w-10" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold truncate max-w-[200px]">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Watermark Option */}
            {file && status === "idle" && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4"
                >
                    <button
                        type="button"
                        onClick={() => setShowWatermarkInput(!showWatermarkInput)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Droplets className="h-4 w-4" />
                        {showWatermarkInput ? "Hide watermark options" : "Add watermark (optional)"}
                    </button>

                    <AnimatePresence>
                        {showWatermarkInput && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3"
                            >
                                <input
                                    type="text"
                                    placeholder="Enter watermark text..."
                                    value={watermark}
                                    onChange={(e) => setWatermark(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            <div className="mt-8 flex justify-center">
                {status === "idle" && file && (
                    <button
                        onClick={handleConvert}
                        className="group flex h-12 items-center gap-2 rounded-full bg-primary px-8 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                        Convert to PDF
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                )}

                {status === "converting" && (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">Converting your file...</p>
                    </div>
                )}

                {status === "success" && downloadUrl && (
                    <div className="flex flex-col items-center gap-4 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-green-600 dark:text-green-400"
                        >
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Conversion Complete!</span>
                        </motion.div>

                        {/* PDF Preview */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-2xl rounded-2xl border border-border overflow-hidden shadow-lg"
                        >
                            <iframe
                                src={downloadUrl}
                                className="w-full h-[500px] bg-white"
                                title="PDF Preview"
                            />
                        </motion.div>

                        <div className="flex gap-3">
                            <a
                                href={downloadUrl}
                                download={file?.name.replace(".docx", ".pdf")}
                                className="flex h-12 items-center gap-2 rounded-full bg-primary px-8 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                            >
                                Download PDF
                            </a>
                            <button
                                onClick={() => {
                                    setFile(null);
                                    setStatus("idle");
                                    setDownloadUrl(null);
                                    setWatermark("");
                                    setShowWatermarkInput(false);
                                }}
                                className="flex h-12 items-center gap-2 rounded-full border border-border bg-background px-6 font-medium text-foreground transition-all hover:bg-muted"
                            >
                                Convert Another
                            </button>
                        </div>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">Something went wrong.</span>
                        </div>
                        <button
                            onClick={() => {
                                setStatus("idle");
                            }}
                            className="text-sm font-medium text-muted-foreground hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
