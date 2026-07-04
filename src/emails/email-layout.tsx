import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";

interface EmailLayoutProps {
  preview: string;
  title: string;
  children: ReactNode;
}

/** Envoltorio visual compartido de los correos transaccionales (identidad MAGNÉTIC). */
export function EmailLayout({ preview, title, children }: EmailLayoutProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f7f4ef", fontFamily: "Helvetica, Arial, sans-serif", padding: "32px 0" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: "32px 40px",
            maxWidth: 480,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 700, letterSpacing: 4, color: "#0e0e0d", margin: 0 }}>
            {siteConfig.name}
          </Text>
          <Hr style={{ borderColor: "#e2dbd0", margin: "20px 0" }} />
          <Heading style={{ fontSize: 18, color: "#0e0e0d", margin: "0 0 16px" }}>{title}</Heading>
          {children}
          <Hr style={{ borderColor: "#e2dbd0", margin: "24px 0 16px" }} />
          <Text style={{ fontSize: 12, color: "#6b5847", margin: 0 }}>
            Notificación automática de {siteConfig.name}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
