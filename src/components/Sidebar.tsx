import { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Plus,
  Users,
  Calendar,
  Phone,
  Building2,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Contact } from '../lib/supabase';

export function Sidebar() {
  const { user } = useAuth();
  const [detectedEmails, setDetectedEmails] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for detected emails from content script
    window.addEventListener('message', (event) => {
      if (event.data.type === 'DETECTED_EMAILS') {
        setDetectedEmails(event.data.emails);
        setCurrentUrl(event.data.url);
        loadContacts();
      }
    });

    // Request email detection
    window.parent.postMessage({ type: 'REFRESH_EMAILS' }, '*');
  }, []);

  const loadContacts = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const addContact = async (email: string) => {
    setLoading(true);
    try {
      // Check if contact already exists
      const { data: existing } = await supabase
        .from('contacts')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        alert('Contact already exists');
        return;
      }

      const { error } = await supabase.from('contacts').insert({
        email,
        user_id: user?.id,
      });

      if (error) throw error;

      await loadContacts();
      setDetectedEmails(detectedEmails.filter((e) => e !== email));
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const logInteraction = async (contactId: string, type: string, content: string) => {
    try {
      await supabase.from('interactions').insert({
        user_id: user?.id,
        contact_id: contactId,
        type,
        content,
        url: currentUrl,
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  };

  const closeSidebar = () => {
    window.parent.postMessage({ type: 'CLOSE_SIDEBAR' }, '*');
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-800 mb-2">
            Sign in to use RelationHub
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Click the extension icon to sign in
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-cyan-500 to-blue-500">
        <div className="flex items-center gap-2 text-white">
          <Users className="w-5 h-5" />
          <h2 className="font-bold">RelationHub</h2>
        </div>
        <button
          onClick={closeSidebar}
          className="p-1 text-white hover:bg-white/20 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Detected Emails */}
        {detectedEmails.length > 0 && (
          <div className="p-4 border-b border-slate-200 bg-cyan-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Detected on Page ({detectedEmails.length})
              </h3>
            </div>
            <div className="space-y-2">
              {detectedEmails.slice(0, 5).map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Mail className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700 truncate">{email}</span>
                  </div>
                  <button
                    onClick={() => addContact(email)}
                    disabled={loading}
                    className="ml-2 p-1.5 text-cyan-600 hover:bg-cyan-100 rounded transition flex-shrink-0"
                    title="Add to contacts"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Contacts */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Recent Contacts</h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No contacts yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 border border-slate-200 rounded-lg hover:border-cyan-300 hover:bg-cyan-50/50 transition cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {contact.name?.charAt(0) || contact.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-800 truncate">
                        {contact.name || contact.email}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{contact.email}</p>
                      {contact.company && (
                        <p className="text-xs text-slate-500 truncate mt-1">
                          {contact.company}
                        </p>
                      )}
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() =>
                            logInteraction(contact.id, 'email', 'Sent email')
                          }
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition"
                          title="Send email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            logInteraction(contact.id, 'call', 'Phone call')
                          }
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition"
                          title="Log call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            logInteraction(contact.id, 'note', 'Met on website')
                          }
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition"
                          title="Add note"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => window.open(chrome.runtime.getURL('index.html'), '_blank')}
              className="w-full flex items-center gap-3 p-3 text-left border border-slate-200 rounded-lg hover:border-cyan-300 hover:bg-cyan-50/50 transition"
            >
              <Users className="w-5 h-5 text-cyan-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">
                  View All Contacts
                </div>
                <div className="text-xs text-slate-500">Open dashboard</div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </button>

            <button className="w-full flex items-center gap-3 p-3 text-left border border-slate-200 rounded-lg hover:border-cyan-300 hover:bg-cyan-50/50 transition">
              <Calendar className="w-5 h-5 text-cyan-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">
                  Schedule Meeting
                </div>
                <div className="text-xs text-slate-500">With a contact</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Add Contact Form Modal */}
      {showAddForm && (
        <AddContactForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            loadContacts();
          }}
        />
      )}
    </div>
  );
}

function AddContactForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.from('contacts').insert({
        email,
        name: name || null,
        company: company || null,
        user_id: user?.id,
      });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-10 flex flex-col">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Add Contact</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Company
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-sm"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
