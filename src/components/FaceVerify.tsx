import { useEffect, useState } from "react";
import { ScanFace, ShieldCheck } from "lucide-react";

type Phase = "idle" | "scanning" | "done";

export function FaceVerify({ verified, onVerified }: { verified: boolean; onVerified: () => void }) {
  const [phase, setPhase] = useState<Phase>(verified ? "done" : "idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== "scanning") return;
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 4)), 100);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "scanning" && progress >= 100) {
      setPhase("done");
      onVerified();
    }
  }, [progress, phase, onVerified]);

  return (
    <div className="rounded-xl border bg-input/40 p-4 text-center">
      <div className="relative mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/60">
        {phase === "done" ? (
          <ShieldCheck className="h-10 w-10 text-primary" />
        ) : (
          <ScanFace className={`h-10 w-10 text-muted-foreground ${phase === "scanning" ? "animate-pulse text-primary" : ""}`} />
        )}
        {phase === "scanning" && (
          <div className="absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_12px] shadow-primary" style={{ top: `${progress}%` }} />
        )}
      </div>
      <p className="mt-3 text-sm font-medium">
        {phase === "done" ? "Simulación completada" : phase === "scanning" ? `Analizando rostro… ${progress}%` : "Verificación facial simulada"}
      </p>
      {phase === "idle" && (
        <button
          type="button"
          onClick={() => { setProgress(0); setPhase("scanning"); }}
          className="mt-3 rounded-full border px-4 py-1.5 text-sm transition hover:bg-secondary"
        >
          Iniciar escaneo
        </button>
      )}
      <p className="mt-2 text-xs text-muted-foreground">Simulación · no se usa tu cámara</p>
    </div>
  );
}
