interface SEOContent {
  title: string;
  content: string;
}

interface SEOContentSectionProps {
  title?: string;
  content: SEOContent[];
  className?: string;
}

export function SEOContentSection({ 
  title = "Your Complete NYC Subway Guide",
  content,
  className = ""
}: SEOContentSectionProps) {
  return (
    <section className={`py-12 bg-gray-50 ${className}`}>
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">{title}</h2>
        
        <div className="prose prose-lg text-gray-700">
          {content.map((section, index) => (
            <div key={index}>
              <h3 className="text-2xl font-bold mt-6 mb-3">{section.title}</h3>
              <p>{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SEOContentSection;