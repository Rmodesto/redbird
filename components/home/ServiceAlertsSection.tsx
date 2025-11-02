interface ServiceAlert {
  type: 'delay' | 'service_change' | 'good_service' | 'planned_work';
  icon: string;
  color: string;
  message: string;
}

interface ServiceAlertsSectionProps {
  alerts: ServiceAlert[];
  title?: string;
  className?: string;
}

export function ServiceAlertsSection({ 
  alerts,
  title = "Live Service Updates",
  className = ""
}: ServiceAlertsSectionProps) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <section className={`py-4 bg-gray-50 border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-500 animate-pulse">●</span>
          <h2 className="font-semibold">{title}</h2>
        </div>
        
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border ${alert.color}`}
            >
              <span className="mr-2">{alert.icon}</span>
              <span className="font-medium">{alert.message}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceAlertsSection;