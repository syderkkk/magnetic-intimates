"use client";

import { Check, CircleAlert, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateAnnouncement } from "@/actions/site";
import { AnnouncementBar } from "@/components/shop/announcement-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AnnouncementConfig,
  AnnouncementIcon,
  AnnouncementItem,
} from "@/config/site";
import { ANNOUNCEMENT_ICONS } from "@/schemas/announcement";
import type { ActionResult } from "@/types/action";

const ICON_LABELS: Record<AnnouncementIcon, string> = {
  none: "Sin ícono",
  truck: "Camión",
  sparkles: "Destellos",
  tag: "Etiqueta",
  gift: "Regalo",
  heart: "Corazón",
  star: "Estrella",
  package: "Paquete",
};

const SIZE_LABELS: Record<AnnouncementConfig["size"], string> = {
  sm: "Delgada",
  md: "Normal",
  lg: "Gruesa",
};

const MAX_ITEMS = 8;

const fieldLabel = "block text-sm font-medium";
const selectClasses =
  "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `m-${Date.now()}-${Math.random()}`;
}

/** Switch accesible (on/off). */
function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={
          checked
            ? "relative h-6 w-10 rounded-full bg-foreground transition-colors"
            : "relative h-6 w-10 rounded-full bg-border transition-colors"
        }
      >
        <span
          className={
            checked
              ? "absolute top-0.5 left-0.5 size-5 translate-x-4 rounded-full bg-background transition-transform"
              : "absolute top-0.5 left-0.5 size-5 translate-x-0 rounded-full bg-background transition-transform"
          }
        />
      </button>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

export function AnnouncementForm({ value }: { value: AnnouncementConfig }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  const [enabled, setEnabled] = useState(value.enabled);
  const [mode, setMode] = useState<AnnouncementConfig["mode"]>(value.mode);
  const [direction, setDirection] = useState<AnnouncementConfig["direction"]>(
    value.direction,
  );
  const [speed, setSpeed] = useState(value.speedSeconds);
  const [pauseOnHover, setPauseOnHover] = useState(value.pauseOnHover);
  const [size, setSize] = useState<AnnouncementConfig["size"]>(value.size);
  const [background, setBackground] = useState(value.background);
  const [foreground, setForeground] = useState(value.foreground);
  const [items, setItems] = useState<AnnouncementItem[]>(
    value.items.map((i) => ({ ...i, icon: i.icon ?? "none" })),
  );

  const config: AnnouncementConfig = {
    enabled,
    mode,
    direction,
    speedSeconds: speed,
    pauseOnHover,
    size,
    background,
    foreground,
    items,
  };

  function updateItem(id: string, patch: Partial<AnnouncementItem>) {
    setItems((list) =>
      list.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      try {
        const res = await updateAnnouncement(config);
        setResult(res);
        if (res.success) router.refresh();
      } catch {
        setResult({
          success: false,
          error: "No se pudo guardar. Inténtalo de nuevo.",
        });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Vista previa en vivo (siempre visible, aunque esté desactivada). */}
      <div>
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Vista previa
        </p>
        <div className="overflow-hidden rounded-xl border">
          <AnnouncementBar config={{ ...config, enabled: true }} />
        </div>
        {!enabled ? (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Está desactivada: así se vería, pero no se muestra en la tienda.
          </p>
        ) : null}
      </div>

      <Switch
        checked={enabled}
        onChange={setEnabled}
        label="Mostrar la cinta en la tienda"
      />

      {/* Mensajes */}
      <div className="space-y-2">
        <p className={fieldLabel}>Mensajes</p>
        <p className="text-xs text-muted-foreground">
          Cada uno aparece en la cinta. Escribe el texto y, opcionalmente, elige
          un ícono.
        </p>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="space-y-2 rounded-xl border bg-muted/20 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Mensaje {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setItems((list) => list.filter((i) => i.id !== item.id))
                  }
                  aria-label={`Quitar mensaje ${index + 1}`}
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>

              <Input
                value={item.text}
                onChange={(e) => updateItem(item.id, { text: e.target.value })}
                placeholder="Ej. Envíos a todo el Perú"
                className="h-10 w-full"
              />

              <div className="flex items-center gap-2">
                <label
                  htmlFor={`icon-${item.id}`}
                  className="text-xs text-muted-foreground"
                >
                  Ícono
                </label>
                <select
                  id={`icon-${item.id}`}
                  value={item.icon ?? "none"}
                  onChange={(e) =>
                    updateItem(item.id, {
                      icon: e.target.value as AnnouncementIcon,
                    })
                  }
                  className={`${selectClasses} h-9 w-40`}
                >
                  {ANNOUNCEMENT_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {ICON_LABELS[icon]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed px-3 py-3 text-center text-sm text-muted-foreground">
              Sin mensajes. Agrega al menos uno para mostrar la cinta.
            </p>
          ) : null}
        </div>

        {items.length < MAX_ITEMS ? (
          <button
            type="button"
            onClick={() =>
              setItems((list) => [
                ...list,
                { id: newId(), text: "", icon: "none" },
              ])
            }
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:border-foreground hover:bg-muted active:scale-[0.98]"
          >
            <Plus className="size-4" aria-hidden="true" />
            Agregar mensaje
          </button>
        ) : null}
      </div>

      {/* Apariencia */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="a-size" className={fieldLabel}>
            Grosor
          </label>
          <select
            id="a-size"
            value={size}
            onChange={(e) =>
              setSize(e.target.value as AnnouncementConfig["size"])
            }
            className={selectClasses}
          >
            {(["sm", "md", "lg"] as const).map((s) => (
              <option key={s} value={s}>
                {SIZE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="space-y-1.5">
            <label htmlFor="a-bg" className={fieldLabel}>
              Fondo
            </label>
            <input
              id="a-bg"
              type="color"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded-lg border border-input bg-transparent"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="a-fg" className={fieldLabel}>
              Texto
            </label>
            <input
              id="a-fg"
              type="color"
              value={foreground}
              onChange={(e) => setForeground(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded-lg border border-input bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* Movimiento */}
      <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
        <div className="space-y-1.5">
          <label htmlFor="a-mode" className={fieldLabel}>
            Movimiento
          </label>
          <select
            id="a-mode"
            value={mode}
            onChange={(e) =>
              setMode(e.target.value as AnnouncementConfig["mode"])
            }
            className={selectClasses}
          >
            <option value="static">Estático (sin movimiento)</option>
            <option value="marquee">Desplazamiento continuo</option>
          </select>
        </div>

        {mode === "marquee" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="a-dir" className={fieldLabel}>
                Dirección
              </label>
              <select
                id="a-dir"
                value={direction}
                onChange={(e) =>
                  setDirection(e.target.value as AnnouncementConfig["direction"])
                }
                className={selectClasses}
              >
                <option value="left">Hacia la izquierda</option>
                <option value="right">Hacia la derecha</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="a-speed" className={fieldLabel}>
                Velocidad: {speed}s por vuelta
              </label>
              <input
                id="a-speed"
                type="range"
                min={5}
                max={120}
                step={1}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full cursor-pointer accent-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Menos segundos = más rápido.
              </p>
            </div>
            <div className="sm:col-span-2">
              <Switch
                checked={pauseOnHover}
                onChange={setPauseOnHover}
                label="Pausar al pasar el cursor"
              />
            </div>
          </div>
        ) : null}
      </div>

      {result ? (
        <p
          role="alert"
          className={
            result.success
              ? "flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700"
              : "flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          }
        >
          {result.success ? (
            <>
              <Check className="size-4 shrink-0" aria-hidden="true" /> Guardado.
            </>
          ) : (
            <>
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              {result.error}
            </>
          )}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 rounded-full px-6 text-sm"
      >
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Guardando…
          </>
        ) : (
          "Guardar cinta"
        )}
      </Button>
    </form>
  );
}
