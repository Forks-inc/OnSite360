import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <h1 className="text-4xl font-bold mb-4">{t('not_found_title', '404 - Page Not Found')}</h1>
      <p className="text-gray-500 mb-6">{t('not_found_desc', 'The page you are looking for does not exist.')}</p>
      <Link to="/" className="btn btn-primary">{t('back_to_dashboard', 'Go back to Dashboard')}</Link>
    </div>
  );
};

export default NotFound;
