import { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Calendar,
  Plus,
  LogOut,
  Search,
  Mail,
  Phone,
  Building2,
  Briefcase,
  X,
  Save,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Contact, Interaction, Meeting } from '../lib/supabase';

type Tab = 'contacts' | 'interactions' | 'meetings';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('contacts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'contacts') {
        const { data } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });
        setContacts(data || []);
      } else if (activeTab === 'interactions') {
        const { data } = await supabase
          .from('interactions')
          .select('*, contacts(name, email)')
          .order('created_at', { ascending: false });
        setInteractions(data || []);
      } else if (activeTab === 'meetings') {
        const { data } = await supabase
          .from('meetings')
          .select('*, contacts(name, email)')
          .order('scheduled_at', { ascending: true });
        setMeetings(data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">RelationHub</h1>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition relative ${
                activeTab === 'contacts'
                  ? 'text-cyan-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Users className="w-5 h-5" />
              Contacts
              {activeTab === 'contacts' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('interactions')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition relative ${
                activeTab === 'interactions'
                  ? 'text-cyan-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Interactions
              {activeTab === 'interactions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition relative ${
                activeTab === 'meetings'
                  ? 'text-cyan-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Meetings
              {activeTab === 'meetings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600" />
              )}
            </button>
          </div>

          {/* Toolbar */}
          {activeTab === 'contacts' && (
            <div className="p-4 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                />
              </div>
              <button
                onClick={() => setShowAddContact(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition"
              >
                <Plus className="w-5 h-5" />
                Add Contact
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Loading...</div>
          ) : activeTab === 'contacts' ? (
            <ContactsList
              contacts={filteredContacts}
              onSelect={setSelectedContact}
              onRefresh={loadData}
            />
          ) : activeTab === 'interactions' ? (
            <InteractionsList interactions={interactions} />
          ) : (
            <MeetingsList meetings={meetings} />
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddContact && (
        <AddContactModal
          onClose={() => setShowAddContact(false)}
          onSuccess={() => {
            setShowAddContact(false);
            loadData();
          }}
        />
      )}

      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}

function ContactsList({
  contacts,
  onSelect,
  onRefresh,
}: {
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
  onRefresh: () => void;
}) {
  if (contacts.length === 0) {
    return (
      <div className="p-12 text-center">
        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-800 mb-2">No contacts yet</h3>
        <p className="text-slate-500">
          Add your first contact or use the Chrome extension to detect contacts on websites
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {contacts.map((contact) => (
        <button
          key={contact.id}
          onClick={() => onSelect(contact)}
          className="w-full p-6 hover:bg-slate-50 transition text-left"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {contact.name?.charAt(0) || contact.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">
                    {contact.name || contact.email}
                  </h3>
                  <p className="text-sm text-slate-500">{contact.email}</p>
                </div>
              </div>
              {(contact.company || contact.title) && (
                <div className="flex items-center gap-4 text-sm text-slate-600 ml-13">
                  {contact.company && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {contact.company}
                    </span>
                  )}
                  {contact.title && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {contact.title}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function InteractionsList({ interactions }: { interactions: any[] }) {
  if (interactions.length === 0) {
    return (
      <div className="p-12 text-center">
        <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-800 mb-2">No interactions yet</h3>
        <p className="text-slate-500">Your interaction history will appear here</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {interactions.map((interaction) => (
        <div key={interaction.id} className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded">
                  {interaction.type}
                </span>
                <span className="text-sm text-slate-500">
                  {new Date(interaction.created_at).toLocaleDateString()}
                </span>
              </div>
              {interaction.subject && (
                <h4 className="font-medium text-slate-800 mb-1">{interaction.subject}</h4>
              )}
              <p className="text-sm text-slate-600">{interaction.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MeetingsList({ meetings }: { meetings: any[] }) {
  if (meetings.length === 0) {
    return (
      <div className="p-12 text-center">
        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-800 mb-2">No meetings scheduled</h3>
        <p className="text-slate-500">Schedule meetings with your contacts</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {meetings.map((meeting) => (
        <div key={meeting.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 mb-1">{meeting.title}</h4>
              <p className="text-sm text-slate-600 mb-2">{meeting.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>{new Date(meeting.scheduled_at).toLocaleString()}</span>
                <span>{meeting.duration_minutes} minutes</span>
                <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                  {meeting.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddContactModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    title: '',
    phone: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.from('contacts').insert({
        ...formData,
        user_id: (await supabase.auth.getUser()).data.user?.id,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Add Contact</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none h-24 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ContactDetailModal({
  contact,
  onClose,
  onUpdate,
}: {
  contact: Contact;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(contact);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .update(formData)
        .eq('id', contact.id);

      if (error) throw error;
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const { error } = await supabase.from('contacts').delete().eq('id', contact.id);
      if (error) throw error;
      onClose();
      onUpdate();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Contact Details</h2>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-2 text-sm text-cyan-600 hover:bg-cyan-50 rounded-lg transition font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-medium">
              {formData.name?.charAt(0) || formData.email.charAt(0).toUpperCase()}
            </div>
            <div>
              {editing ? (
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-2xl font-bold text-slate-800 border border-slate-200 rounded-lg px-2 py-1"
                  placeholder="Name"
                />
              ) : (
                <h3 className="text-2xl font-bold text-slate-800">
                  {formData.name || 'No name'}
                </h3>
              )}
              <p className="text-slate-500">{formData.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              ) : (
                <p className="text-slate-600">{formData.company || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              ) : (
                <p className="text-slate-600">{formData.title || '-'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              ) : (
                <p className="text-slate-600">{formData.phone || '-'}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </label>
            {editing ? (
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg h-32 resize-none"
              />
            ) : (
              <p className="text-slate-600 whitespace-pre-wrap">
                {formData.notes || 'No notes'}
              </p>
            )}
          </div>

          {!editing && (
            <div className="flex gap-3 pt-4">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition">
                <Mail className="w-5 h-5" />
                Send Email
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition">
                <Calendar className="w-5 h-5" />
                Schedule Meeting
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
