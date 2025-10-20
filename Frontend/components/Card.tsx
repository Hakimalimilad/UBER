interface CardProps {
  title?: string;
  value?: string | number;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const Card = ({ title, value, icon, className = '', children }: CardProps) => {
  // If children are provided, render as a container card
  if (children) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        {children}
      </div>
    );
  }

  // Otherwise, render as a stat card
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center">
        {icon && (
          <div className="p-3 bg-indigo-100 rounded-lg mr-4">
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
