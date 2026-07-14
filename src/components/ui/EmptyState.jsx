import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const EmptyState = ({
  title = 'لا توجد نتائج',
  description = 'لم نتمكن من العثور على ما تبحث عنه. حاول تصفح أقسام أخرى أو تعديل خيارات البحث.',
  actionText,
  actionLink,
  onActionClick,
  icon = 'search',
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'cart':
        return (
          <svg className="h-16 w-16 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        );
      case 'order':
        return (
          <svg className="h-16 w-16 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 2.24c0-.067-.002-.133-.005-.2a3.25 3.25 0 01-3.243-3.25c0-.066.002-.132.005-.198m0 0L3 3m3.003 3.003L3.003 3m0 0h1.002m-1.002 0v1.002M9 10.5h.008v.008H9v-.008zm0 2.25h.008v.008H9v-.008zm0 2.25h.008v.008H9v-.008z" />
          </svg>
        );
      default:
        return (
          <svg className="h-16 w-16 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col items-center text-center justify-center p-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-stone-100 max-w-lg mx-auto shadow-sm">
      <div className="p-4 bg-stone-50 rounded-2xl mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-xl font-bold text-stone-800 mb-2">{title}</h3>
      <p className="text-stone-500 text-base mb-6 leading-relaxed">{description}</p>
      
      {actionLink && (
        <Link to={actionLink}>
          <Button variant="primary">{actionText}</Button>
        </Link>
      )}

      {!actionLink && actionText && onActionClick && (
        <Button variant="primary" onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
