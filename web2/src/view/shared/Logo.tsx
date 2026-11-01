export default function Logo({ className = "logo" }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="FXCC — Trade with Confidence.">
      <strong>
        FX<span>CC</span>
      </strong>
      <small>TRADE WITH CONFIDENCE.</small>
    </div>
  );
}
