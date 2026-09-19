import { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: ReactNode;
};

export function SectionHeading({ eyebrow, title, text, action }: SectionHeadingProps) {
  return (
    <div className="section-heading" data-reveal>
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
