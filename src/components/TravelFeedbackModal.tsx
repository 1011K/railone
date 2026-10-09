import React, { useState } from 'react';
import { AccessibleModal } from './common/AccessibleModal';
import { Star, MessageSquare, CheckCircle2, Shield, Send } from 'lucide-react';

interface TravelFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStation?: string;
  defaultTrain?: string;
}

export const TravelFeedbackModal: React.FC<TravelFeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultStation = 'Dadar (DR)',
  defaultTrain = 'Suburban Fast Local'
}) => {
  const [cleanliness, setCleanliness] = useState<number>(4);
  const [punctuality, setPunctuality] = useState<number>(4);
  const [amenities, setAmenities] = useState<number>(4);
  const [safety, setSafety] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [trainInfo, setTrainInfo] = useState<string>(defaultTrain);
  const [stationInfo, setStationInfo] = useState<string>(defaultStation);
  const [submittedToken, setSubmittedToken] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `RO-FB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const feedbackEntry = {
      token,
      timestamp: new Date().toISOString(),
      trainInfo,
      stationInfo,
      ratings: { cleanliness, punctuality, amenities, safety },
      comment
    };

    try {
      const existing = JSON.parse(localStorage.getItem('railone_feedback_entries') || '[]');
      existing.unshift(feedbackEntry);
      localStorage.setItem('railone_feedback_entries', JSON.stringify(existing.slice(0, 50)));
    } catch {
      // storage unavailable fallback
    }

    setSubmittedToken(token);
  };

  const renderStarRating = (value: number, onChange: (val: number) => void, label: string) => (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-xs">
      <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-slate-300 dark:text-slate-600 hover:text-amber-400 focus:outline-hidden"
            aria-label={`${star} stars`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= value ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Travel Experience Feedback"
      subtitle="Indian Railways Commuter & Passenger Voice Portal"
      variant="sheet"
      maxWidthClass="max-w-xl"
    >
      {submittedToken ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Thank You for Your Feedback!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Your commute ratings have been recorded in the local passenger registry to improve transit recommendations.
            </p>
          </div>
          <div className="inline-block px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Reference Token: {submittedToken}
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                setSubmittedToken(null);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
            Rate your recent suburban or long-distance journey. For urgent safety, security or grievance escalations, use the official RailMadad 139 helpline.
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Train / Transit Line
              </label>
              <input
                type="text"
                value={trainInfo}
                onChange={(e) => setTrainInfo(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Station / Junction
              </label>
              <input
                type="text"
                value={stationInfo}
                onChange={(e) => setStationInfo(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 space-y-1">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Performance & Hygiene Ratings
            </span>
            {renderStarRating(cleanliness, setCleanliness, 'Cleanliness & Sanitation')}
            {renderStarRating(punctuality, setPunctuality, 'Punctuality & Arrival Precision')}
            {renderStarRating(amenities, setAmenities, 'Coach Amenities & Airflow / AC')}
            {renderStarRating(safety, setSafety, 'RPF / Security & Women Safety')}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Comments & Observations
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share coach conditions, crowding, escalator functionality, or passenger assistance..."
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all min-h-[44px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Feedback</span>
            </button>
          </div>
        </form>
      )}
    </AccessibleModal>
  );
};
