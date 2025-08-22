import React, { useState } from 'react';
import { Send, CheckCircle, Filter, ExternalLink, X, MessageSquare } from 'lucide-react';

interface SlackRequest {
  id: string;
  createdAt: string;
  translationKeys: string[];
  slackUrl: string;
  completionStatus: {
    de: boolean;
    es: boolean;
    pt: boolean;
    nl: boolean;
    fr: boolean;
    it: boolean;
  };
}

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SlackRequest;
  onSend: () => void;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center text-green-700">
            <CheckCircle className="w-6 h-6 mr-2" />
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700">{message}</p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, request, onSend }) => {
  if (!isOpen) return null;

  const incompleteLangs = Object.entries(request.completionStatus)
    .filter(([_, completed]) => !completed)
    .map(([lang, _]) => lang);

  const languageTeams = {
    de: '@germany-translation-team',
    es: '@spain-translation-team',
    pt: '@portugal-translation-team',
    nl: '@netherlands-translation-team',
    fr: '@france-translation-team',
    it: '@italy-translation-team',
  };

  const reminderMessage = `👋 Hi ${incompleteLangs.map(lang => languageTeams[lang as keyof typeof languageTeams]).join(', ')},

Could you take a look at the translation progress? We're still waiting for updates on these translation keys:

📋 **Translation Keys:**
${request.translationKeys.map(key => `▪️ \`${key}\``).join('\n')}

🌍 **Pending Languages:** ${incompleteLangs.map(lang => lang.toUpperCase()).join(', ')}

Thank you for your support! 🙏`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Send Reminder
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Message Preview
          </label>
          <textarea
            value={reminderMessage}
            readOnly
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
          />
        </div>
        
        <div className="mb-4 p-3 bg-amber-50 rounded-md border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Reminder for request from {request.createdAt}</strong>
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Pending languages: {incompleteLangs.map(lang => lang.toUpperCase()).join(', ')}
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSend();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

export const Analytics: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [reminderModal, setReminderModal] = useState<{isOpen: boolean, request: SlackRequest | null}>({
    isOpen: false,
    request: null
  });
  const [successModal, setSuccessModal] = useState<{isOpen: boolean, title: string, message: string}>({
    isOpen: false,
    title: '',
    message: ''
  });
  
  const mockSlackRequests: SlackRequest[] = [
    {
      id: '1',
      createdAt: '2024-01-16',
      translationKeys: ['DETAIL_MULTI_RATE_CANCELLATION_OPTIONS_AVAILABLE', 'DETAIL_MULTI_RATE_BOARD_TYPE_OPTIONS_AVAILABLE'],
      slackUrl: 'https://holidu.slack.com/archives/C123456789/p1642345678',
      completionStatus: {
        de: true,
        es: false,
        pt: true,
        nl: false,
        fr: true,
        it: false,
      },
    },
    {
      id: '2',
      createdAt: '2024-01-15',
      translationKeys: ['LIST_SMART_SEARCH_TITLE'],
      slackUrl: 'https://holidu.slack.com/archives/C123456789/p1642345679',
      completionStatus: {
        de: false,
        es: false,
        pt: false,
        nl: false,
        fr: false,
        it: false,
      },
    },
    {
      id: '3',
      createdAt: '2024-01-14',
      translationKeys: ['BOOKING_CONFIRMATION_TITLE', 'PAYMENT_SUCCESS_MESSAGE'],
      slackUrl: 'https://holidu.slack.com/archives/C123456789/p1642345680',
      completionStatus: {
        de: true,
        es: true,
        pt: true,
        nl: true,
        fr: true,
        it: true,
      },
    },
  ];

  const languageFlags: Record<string, string> = {
    de: '🇩🇪',
    es: '🇪🇸',
    pt: '🇵🇹',
    nl: '🇳🇱',
    fr: '🇫🇷',
    it: '🇮🇹',
  };

  const getCompletionRate = (request: SlackRequest): number => {
    const completed = Object.values(request.completionStatus).filter(Boolean).length;
    const total = Object.keys(request.completionStatus).length;
    return Math.round((completed / total) * 100);
  };

  const isRequestComplete = (request: SlackRequest): boolean => {
    return Object.values(request.completionStatus).every(Boolean);
  };

  const handleSendReminder = (requestId: string) => {
    const request = mockSlackRequests.find(req => req.id === requestId);
    if (request) {
      setReminderModal({ isOpen: true, request });
    }
  };

  const handleSendReminderMessage = () => {
    console.log('Sending reminder for request:', reminderModal.request?.id);
    setReminderModal({ isOpen: false, request: null });
    setSuccessModal({
      isOpen: true,
      title: 'Reminder Sent!',
      message: 'Reminder has been sent successfully to the translation channel.'
    });
  };

  const filteredRequests = mockSlackRequests
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter(request => {
      const isComplete = isRequestComplete(request);
      if (filter === 'complete') return isComplete;
      if (filter === 'incomplete') return !isComplete;
      return true;
    });

  return (
    <div className="px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Slack Proofreading Requests</h2>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'complete' | 'incomplete')}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Requests</option>
                  <option value="incomplete">Incomplete</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {filteredRequests.map((request) => {
                const completionRate = getCompletionRate(request);
                const isComplete = isRequestComplete(request);
                
                return (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`text-xl font-bold px-3 py-1 rounded-md ${
                          isComplete ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {completionRate}%
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            Request {request.createdAt}
                          </span>
                          <a
                            href={request.slackUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                            title="Open in Slack"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {!isComplete && (
                          <button
                            onClick={() => handleSendReminder(request.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Send Reminder
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Translation Keys:</p>
                      <div className="flex flex-wrap gap-2">
                        {request.translationKeys.map((key) => (
                          <span key={key} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                            {key}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Progress by Language:</p>
                      <div className="flex space-x-3">
                        {Object.entries(request.completionStatus).map(([lang, completed]) => (
                          <div key={lang} className="flex items-center">
                            <span 
                              className={`text-lg ${completed ? 'opacity-100' : 'opacity-30'}`}
                              title={`${lang.toUpperCase()} ${completed ? 'completed' : 'pending'}`}
                            >
                              {languageFlags[lang]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {reminderModal.request && (
        <ReminderModal
          isOpen={reminderModal.isOpen}
          onClose={() => setReminderModal({ isOpen: false, request: null })}
          request={reminderModal.request}
          onSend={handleSendReminderMessage}
        />
      )}

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({isOpen: false, title: '', message: ''})}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
};