import type { Metadata } from "next";

import {
  removeSiteImage,
  updateSiteImage,
  updateSiteText,
} from "@/actions/site";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTextForm } from "@/components/admin/admin-text-form";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { ImageUploader } from "@/components/admin/image-uploader";
import { siteConfig } from "@/config/site";
import { getAnnouncement, getSiteSettings, SETTING_KEYS } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Apariencia" };

export default async function AppearancePage() {
  const [settings, announcement] = await Promise.all([
    getSiteSettings(),
    getAnnouncement(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Apariencia"
        description="Personaliza lo que se ve en la página de inicio. Los cambios se guardan al instante."
      />

      <div className="max-w-2xl space-y-6">
        {/* Cinta de anuncios */}
        <section className="rounded-2xl border bg-background p-5 sm:p-6">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Cinta de anuncios
          </h2>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            Es la barra superior de la web (la franja de color arriba del menú).
            Actívala o desactívala, edita los mensajes, el color, el grosor y el
            movimiento. Abajo ves una vista previa en vivo.
          </p>
          <AnnouncementForm value={announcement} />
        </section>

        {/* Portada del inicio */}
        <section className="rounded-2xl border bg-background p-5 sm:p-6">
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Portada del inicio
          </h2>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            Es la imagen grande y el texto principal que se ven al entrar a la
            web. Si no defines una imagen, se usa un fondo de marca.
          </p>

          <div className="space-y-5">
            <AdminTextForm
              label="Título"
              defaultValue={settings[SETTING_KEYS.heroTitle] ?? ""}
              action={updateSiteText}
              valueKey="value"
              extraFields={{ key: SETTING_KEYS.heroTitle }}
              placeholder={siteConfig.hero.title}
            />
            <AdminTextForm
              label="Subtítulo"
              defaultValue={settings[SETTING_KEYS.heroSubtitle] ?? ""}
              action={updateSiteText}
              valueKey="value"
              extraFields={{ key: SETTING_KEYS.heroSubtitle }}
              multiline
              placeholder={siteConfig.hero.subtitle}
            />
            <div>
              <p className="mb-2 text-sm font-medium">Imagen de portada</p>
              <ImageUploader
                currentUrl={settings[SETTING_KEYS.heroImage] || null}
                alt="Portada del inicio"
                fields={{ key: SETTING_KEYS.heroImage }}
                uploadAction={updateSiteImage}
                removeAction={removeSiteImage}
                aspectClass="aspect-video"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
