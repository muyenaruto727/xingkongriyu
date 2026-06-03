

const Card = ({ title, description, buttonText, buttonUrl, onClick, icon, iconBg, iconText, buttonBg }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`${iconBg} ${iconText} rounded-full w-14 h-14 flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h4 className="text-lg font-semibold mb-2 text-gray-800">{title}</h4>
      <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
      {onClick ? (
        <button onClick={onClick} className={`${buttonBg} text-white px-4 py-2 rounded-lg transition-colors inline-block font-medium`}>
          {buttonText}
        </button>
      ) : (
        <a href={buttonUrl} className={`${buttonBg} text-white px-4 py-2 rounded-lg transition-colors inline-block font-medium`}>
          {buttonText}
        </a>
      )}
    </div>
  );
};

export default Card;