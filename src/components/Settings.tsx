import React, { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export const AppSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    slackChannel: '#translations',
    defaultProject: 'Holidu Web',
    autoTranslate: true,
    notifications: true,
  });

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // Handle settings save
  };

  return (
    <div className="px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Slack Channel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Slack Channel
              </label>
              <input
                type="text"
                value={settings.slackChannel}
                onChange={(e) => handleSettingChange('slackChannel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Default Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Project
              </label>
              <select
                value={settings.defaultProject}
                onChange={(e) => handleSettingChange('defaultProject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Holidu Web">Holidu Web</option>
                <option value="Mobile">Mobile</option>
                <option value="Backend">Backend</option>
                <option value="Admin">Admin</option>
                <option value="API">API</option>
                <option value="CMS">CMS</option>
              </select>
            </div>

            {/* Auto Translate */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Auto-translate</h3>
                <p className="text-sm text-gray-500">Automatically generate translations when creating new keys</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoTranslate}
                onChange={(e) => handleSettingChange('autoTranslate', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                <p className="text-sm text-gray-500">Receive notifications about translation updates</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};