export default function QtyStepper({
  value,
  onMinus,
  onPlus,
  className = '',
}: {
  value: number;
  onMinus: () => void;
  onPlus: () => void;
  className?: string;
}) {
  return (
    <div className={('qty-stepper ' + className).trim()}>
      <button className="qty-btn qty-minus" type="button" aria-label="Decrease quantity" onClick={onMinus}>
        −
      </button>
      <span className="qty-value">{value}</span>
      <button className="qty-btn qty-plus" type="button" aria-label="Increase quantity" onClick={onPlus}>
        +
      </button>
    </div>
  );
}
