interface ServiceAlertProps {
  type: "delay" | "service_change" | "good_service";
  message: string;
  icon?: string;
}

const alertStyles = {
  delay: {
    icon: "🕐",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200"
  },
  service_change: {
    icon: "⚠️", 
    color: "text-red-600 bg-red-50 border-red-200"
  },
  good_service: {
    icon: "✅",
    color: "text-green-600 bg-green-50 border-green-200"
  }
};

export default function ServiceAlert({ type, message, icon }: ServiceAlertProps) {
  const style = alertStyles[type];
  const displayIcon = icon || style.icon;

  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap ${style.color}`}>
      <span>{displayIcon}</span>
      <span>{message}</span>
    </div>
  );
}