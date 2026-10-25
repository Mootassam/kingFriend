export default function Logo({ className = "logo" }: { className?: string }) {
  return (
    <div className={className} role="img" aria-label="KingFriend — Trade with Confidence.">
      <strong>
        King<span>Friend</span>
      </strong>
      <small>TRADE WITH CONFIDENCE.</small>
    </div>
  );
}
