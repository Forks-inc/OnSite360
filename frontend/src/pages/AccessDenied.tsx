import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

const AccessDenied = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <h1 className="text-4xl font-bold text-error mb-4">{t('access_denied_title', 'Access Denied')}</h1>
      <p className="text-gray-500 mb-2">{t('access_denied_desc', "You don't have permission to access this page.")}</p>
      <p className="text-gray-400 text-sm mb-6">{t('access_denied_contact', 'Please contact your administrator if you believe this is an error.')}</p>
      <Link to="/" className="btn btn-primary">{t('back_to_home', 'Go back to Home')}</Link>
    </div>
  );
};

export default AccessDenied;
