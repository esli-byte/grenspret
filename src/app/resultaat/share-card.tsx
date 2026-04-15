"use client";

import { forwardRef } from "react";

type Props = {
  besparing: number;
  land: string;
  vlag: string;
  besparingTanken: number;
  besparingBoodschappen: number;
  reiskosten: number;
  rijtijdMin?: number;
  afstandKm?: number;
  aantalHuishoudens: number;
};

function euro(bedrag: number) {
  return `€${bedrag.toFixed(2).replace(".", ",")}`;
}

/**
 * Mooi opgemaakte "share card" die omgezet wordt naar een PNG
 * voor WhatsApp, Instagram, etc. Inline styles ipv Tailwind
 * voor betrouwbaardere rendering door html-to-image.
 */
export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard(
  {
    besparing,
    land,
    vlag,
    besparingTanken,
    besparingBoodschappen,
    reiskosten,
    rijtijdMin,
    afstandKm,
    aantalHuishoudens,
  },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        width: "600px",
        padding: "40px",
        background: "linear-gradient(135deg, #0A1628 0%, #0F1F35 50%, #1B3B5F 100%)",
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        color: "white",
        borderRadius: "32px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle accent glow */}
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: "240px",
          height: "240px",
          borderRadius: "50%",
          background: "rgba(0, 210, 106, 0.15)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Header — logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "28px" }}>💰</span>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Grens<span style={{ color: "#00D26A" }}>pret</span>
          </span>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Grensbesparing
        </span>
      </div>

      {/* Main besparing */}
      <div
        style={{
          padding: "28px",
          background: "linear-gradient(135deg, #00D26A 0%, #00B358 100%)",
          borderRadius: "24px",
          marginBottom: "24px",
          boxShadow: "0 12px 32px rgba(0, 210, 106, 0.25)",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.85)",
            marginBottom: "6px",
          }}
        >
          {aantalHuishoudens > 1
            ? `Wij besparen met ${aantalHuishoudens} huishoudens`
            : "Ik bespaar"}
        </div>
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            marginBottom: "8px",
          }}
        >
          {euro(besparing)}
        </div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {vlag} door over de grens te shoppen in {land}
        </div>
      </div>

      {/* Breakdown */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "12px",
          }}
        >
          Opbouw van de besparing
        </div>

        {besparingTanken > 0 && (
          <Row label="⛽  Tanken" value={`+${euro(besparingTanken)}`} color="#00D26A" />
        )}
        {besparingBoodschappen > 0 && (
          <Row label="🛒  Boodschappen" value={`+${euro(besparingBoodschappen)}`} color="#00D26A" />
        )}
        {reiskosten > 0 && (
          <Row label="🚗  Reiskosten heen en terug" value={`−${euro(reiskosten)}`} color="#FF6B6B" />
        )}
        <div
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.1)",
            margin: "12px 0",
          }}
        />
        <Row
          label="Netto resultaat"
          value={`+${euro(besparing)}`}
          color="#00D26A"
          bold
        />
      </div>

      {/* Route info */}
      {(afstandKm || rijtijdMin) && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          {afstandKm !== undefined && (
            <InfoChip icon="📍" label={`${afstandKm} km retour`} />
          )}
          {rijtijdMin !== undefined && (
            <InfoChip
              icon="⏱️"
              label={
                rijtijdMin >= 60
                  ? `${Math.floor(rijtijdMin / 60)}u ${rijtijdMin % 60}min`
                  : `${rijtijdMin} min rijden`
              }
            />
          )}
        </div>
      )}

      {/* Footer / CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "20px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
            Bereken je eigen besparing
          </div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "#00D26A" }}>
            grenspret.nl
          </div>
        </div>
        <div
          style={{
            padding: "10px 18px",
            background: "rgba(0, 210, 106, 0.15)",
            border: "1px solid rgba(0, 210, 106, 0.3)",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 800,
            color: "#00D26A",
          }}
        >
          Samen besparen →
        </div>
      </div>
    </div>
  );
});

function Row({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color: string;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 0",
      }}
    >
      <span
        style={{
          fontSize: bold ? "15px" : "14px",
          fontWeight: bold ? 800 : 600,
          color: bold ? "white" : "rgba(255,255,255,0.85)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: bold ? "18px" : "14px",
          fontWeight: 800,
          color,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function InfoChip({ icon, label }: { icon: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 12px",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
        color: "rgba(255,255,255,0.9)",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
