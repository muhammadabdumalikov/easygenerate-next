import { 
  RefreshCw, 
  Star, 
  Cloud, 
  Settings, 
  Shield, 
  Monitor 
} from 'react-feather';

const features = [
  {
    icon: RefreshCw,
    title: "300+ formats supported",
    description: "We support more than 25,600 different conversions between more than 300 different file formats. More than any other converter."
  },
  {
    icon: Star,
    title: "Fast and easy",
    description: "Just drop your files on the page, choose an output format and click 'Convert' button. Wait a little for the process to complete. We aim to do all our conversions in under 1-2 minutes."
  },
  {
    icon: Cloud,
    title: "In the cloud",
    description: "All conversions take place in the cloud and will not consume any capacity from your computer."
  },
  {
    icon: Settings,
    title: "Custom settings",
    description: "Most conversion types support advanced options. For example with a video converter you can choose quality, aspect ratio, codec and other settings, rotate and flip."
  },
  {
    icon: Shield,
    title: "Security guaranteed",
    description: "We delete uploaded files instantly and converted ones after 24 hours. No one has access to your files and privacy is 100% guaranteed."
  },
  {
    icon: Monitor,
    title: "All devices supported",
    description: "Converto is browser-based and works for all platforms. There is no need to download and install any software."
  }
];

export default function FeaturesSection() {
  return (
    <div className="w-full max-w-6xl mx-auto py-16 px-6">
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 mb-20">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div key={index} className="text-center group">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:border-indigo-500 transition-colors duration-300">
                  <IconComponent className="w-7 h-7 text-gray-600 group-hover:text-indigo-600 transition-colors duration-300" strokeWidth={1.5} />
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Rating Section */}
      <div className="border-t border-gray-200 pt-16 mt-8">
        <div className="text-center max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-8">
            Overall conversion quality rating
          </h3>
          
          <div className="flex items-center justify-center gap-6 mb-3">
            {/* Star Rating */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="relative">
                  {index < 4 ? (
                    // Full stars
                    <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" strokeWidth={0} />
                  ) : (
                    // Partial star (4.6 rating)
                    <div className="relative">
                      <Star className="w-7 h-7 text-gray-200 fill-gray-200" strokeWidth={0} />
                      <div 
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: '60%' }}
                      >
                        <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" strokeWidth={0} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Rating Number */}
            <div className="text-4xl font-bold text-gray-900">
              4.6
            </div>
          </div>
          
          {/* Vote Count */}
          <p className="text-base text-gray-500 mb-6">
            (29,023,897 votes)
          </p>
          
          {/* Call to Action */}
          <p className="text-sm text-gray-400">
            You need to convert and download at least 1 file to provide feedback!
          </p>
        </div>
      </div>
    </div>
  );
}
