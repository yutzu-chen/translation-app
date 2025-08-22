import React, { useState } from 'react';
import { Send, X, CheckCircle } from 'lucide-react';

interface TranslationKey {
  id: string;
  key: string;
  englishText: string;
  project: string;
  createdAt: string;
  requester: string;
  status: 'in_progress' | 'completed' | 'sent';
}

interface SlackModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKeys: TranslationKey[];
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

const SlackModal: React.FC<SlackModalProps> = ({ isOpen, onClose, selectedKeys, onSend }) => {
  if (!isOpen) return null;

  const slackMessage = `👋 Hi translators,

Could you please take a look at the translations and adjust the texts if needed?
Thank you for your support and have a nice day! 🙏

📋 **Translation Keys:**
${selectedKeys.map(key => `▪️ \`${key.key}\` [POEditor Link](https://poeditor.com/projects/view?id=123456&key=${key.key})`).join('\n')}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Send to Slack</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slack Message Preview
          </label>
          <textarea
            value={slackMessage}
            readOnly
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
          />
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {selectedKeys.length} translation key{selectedKeys.length !== 1 ? 's' : ''} selected
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
            Send to Slack
          </button>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isSlackModalOpen, setIsSlackModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState<{isOpen: boolean, title: string, message: string}>({
    isOpen: false,
    title: '',
    message: ''
  });

  const [translationKeys, setTranslationKeys] = useState<TranslationKey[]>([
    {
      id: '1',
      key: 'DETAIL_MULTI_RATE_CANCELLATION_OPTIONS_AVAILABLE',
      englishText: 'Cancellation options available for different rates',
      project: 'Holidu Web',
      createdAt: '2024-01-15',
      requester: 'Sarah Johnson',
      status: 'in_progress',
    },
    {
      id: '2',
      key: 'DETAIL_MULTI_RATE_BOARD_TYPE_OPTIONS_AVAILABLE',
      englishText: 'Board type options available for multi-rate bookings',
      project: 'Mobile',
      createdAt: '2024-01-14',
      requester: 'Mike Chen',
      status: 'in_progress',
    },
    {
      id: '3',
      key: 'LIST_SMART_SEARCH_TITLE',
      englishText: 'Smart search results',
      project: 'Backend',
      createdAt: '2024-01-13',
      requester: 'Anna Schmidt',
      status: 'in_progress',
    },
    {
      id: '4',
      key: 'BOOKING_CONFIRMATION_TITLE',
      englishText: 'Booking confirmation',
      project: 'Holidu Web',
      createdAt: '2024-01-12',
      requester: 'John Doe',
      status: 'sent',
    },
    {
      id: '5',
      key: 'PAYMENT_SUCCESS_MESSAGE',
      englishText: 'Payment successful',
      project: 'Mobile',
      createdAt: '2024-01-11',
      requester: 'Lisa Wang',
      status: 'sent',
    },
  ]);

  const inProgressKeys = translationKeys.filter(key => key.status === 'in_progress');
  const sentKeys = translationKeys.filter(key => key.status === 'sent');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeys(inProgressKeys.map(key => key.id));
    } else {
      setSelectedKeys([]);
    }
  };

  const handleSelectKey = (keyId: string, checked: boolean) => {
    if (checked) {
      setSelectedKeys([...selectedKeys, keyId]);
    } else {
      setSelectedKeys(selectedKeys.filter(id => id !== keyId));
    }
  };

  const getSelectedTranslationKeys = () => {
    return translationKeys.filter(key => selectedKeys.includes(key.id));
  };

  const handleSendToSlack = () => {
    const selectedKeysData = getSelectedTranslationKeys();
    console.log('Sending to Slack:', selectedKeysData);
    
    // Update the status of selected keys to 'sent'
    setTranslationKeys(prevKeys => 
      prevKeys.map(key => 
        selectedKeys.includes(key.id) 
          ? { ...key, status: 'sent' as const }
          : key
      )
    );
    
    setIsSlackModalOpen(false);
    setSelectedKeys([]);
    setSuccessModal({
      isOpen: true,
      title: 'Sent Successfully!',
      message: `${selectedKeysData.length} translation key(s) have been sent to Slack successfully.`
    });
  };

  const renderKeysTable = (keys: TranslationKey[], title: string, showCheckboxes = false) => (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {showCheckboxes && (
            <button
              onClick={() => setIsSlackModalOpen(true)}
              disabled={selectedKeys.length === 0}
              className={`px-4 py-2 rounded-md flex items-center ${
                selectedKeys.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Send className="w-4 h-4 mr-2" />
              Send to Slack {selectedKeys.length > 0 && `(${selectedKeys.length})`}
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {showCheckboxes && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedKeys.length === keys.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                English Text
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {keys.map((translationKey) => (
              <tr key={translationKey.id} className="hover:bg-gray-50">
                {showCheckboxes && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(translationKey.id)}
                      onChange={(e) => handleSelectKey(translationKey.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{translationKey.key}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{translationKey.englishText}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {translationKey.project}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {translationKey.requester}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {translationKey.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-6">
      {renderKeysTable(inProgressKeys, "Translation Keys", true)}
      {sentKeys.length > 0 && renderKeysTable(sentKeys, "Request sent")}

      <SlackModal
        isOpen={isSlackModalOpen}
        onClose={() => setIsSlackModalOpen(false)}
        selectedKeys={getSelectedTranslationKeys()}
        onSend={handleSendToSlack}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({isOpen: false, title: '', message: ''})}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
};