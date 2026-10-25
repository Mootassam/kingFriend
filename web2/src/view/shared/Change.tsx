export default function Change({ value }: { value: number }) {
  return (
    <span className={"numeric " + (value >= 0 ? "positive" : "negative")}>
      {value >= 0 ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}
