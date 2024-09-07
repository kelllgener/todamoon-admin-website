// components/ActionButtons.tsx
import { title } from "process";
import React from "react";

interface ActionButtonsProps {
  uid: string;
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: (uid: string) => void;
  className: string;
  color: string;
  title: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  uid,
  Icon,
  onClick,
  className = "",
  color,
  title,
}) => {
  return (
    <div className="tooltip" data-tip={title}>
      <button
        className={`btn ${className} mr-2 btn-sm btn-outline`}
        onClick={() => onClick(uid)}
      >
        {Icon && <Icon className={`h-3 w-3 ${color}`} />}
      </button>
    </div>
  );
};

export default ActionButtons;
