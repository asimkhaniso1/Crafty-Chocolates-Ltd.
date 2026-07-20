interface StepPlaceholderProps {
  title: string;
  subtitle: string;
}

/** Shared shell for steps not yet built out by downstream agents. */
export default function StepPlaceholder({ title, subtitle }: StepPlaceholderProps) {
  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {title}
      </h2>
      <p className="text-clay font-medium mb-10 max-w-lg">{subtitle}</p>
      <div className="border border-dashed border-choco/20 rounded-sm p-12 text-center text-clay/60 font-sans text-xs uppercase tracking-[0.2em]">
        Coming soon
      </div>
    </div>
  );
}
