import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Phone, Mail, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '../ui/alert-dialog';
import { toast } from 'react-toastify';

const SOSManagement = ({ onBack }) => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deleteContactId, setDeleteContactId] = useState(null);
    const [editingContact, setEditingContact] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        relation: '',
        mobile: '',
        email: ''
    });

    const maxContacts = 5;
    const canAddMore = contacts.length < maxContacts;

    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const API_BASE = `${BASE_URL}/api/sos`;

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    const apiRequest = async (method, path, body) => {
        const res = await fetch(`${API_BASE}${path}`, {
            method,
            headers: getAuthHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data?.message || 'Request failed');
        }
        return data;
    };

    // Load contacts on mount
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await apiRequest('GET', '/sos-contacts');
                setContacts(Array.isArray(data?.data) ? data.data : []);
            } catch (e) {
                toast.error(e.message || 'Failed to load SOS contacts');
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddClick = () => {
        if (!canAddMore) {
            toast.info('You cannot add more than 5 SOS contacts.');
            return;
        }
        setFormData({ name: '', relation: '', mobile: '', email: '' });
        setIsAddModalOpen(true);
    };

    const handleEditContact = (contact) => {
        setEditingContact(contact);
        setFormData({
            name: contact.name || '',
            relation: contact.relation || '',
            mobile: contact.mobile || '',
            email: contact.email || '',
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteContact = (contactId) => {
        setDeleteContactId(contactId);
    };

    const confirmDelete = async () => {
        if (!deleteContactId) return;
        try {
            const data = await apiRequest('DELETE', `/sos-contacts/${deleteContactId}`);
            setContacts(Array.isArray(data?.data) ? data.data : []);
            toast.success('Contact deleted successfully');
        } catch (e) {
            toast.error(e.message || 'Failed to delete contact');
        } finally {
            setDeleteContactId(null);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Required fields: name, relation, email (mobile optional)
        if (!formData.name || !formData.relation || !formData.email) {
            toast.error('Please fill in Name, Relation, and Email.');
            return;
        }

        try {
            if (isEditModalOpen && editingContact?._id) {
                // Update existing
                const payload = {
                    name: formData.name,
                    relation: formData.relation,
                    email: formData.email,
                    mobile: formData.mobile,
                };
                const data = await apiRequest('PATCH', `/sos-contacts/${editingContact._id}`, payload);
                setContacts(Array.isArray(data?.data) ? data.data : []);
                toast.success('Contact updated successfully');
                setIsEditModalOpen(false);
            } else {
                // Add new
                const payload = {
                    name: formData.name,
                    relation: formData.relation,
                    email: formData.email,
                    mobile: formData.mobile,
                };
                const data = await apiRequest('POST', '/sos-contacts', payload);
                setContacts(Array.isArray(data?.data) ? data.data : []);
                toast.success('Contact added successfully');
                setIsAddModalOpen(false);
            }
            setFormData({ name: '', relation: '', mobile: '', email: '' });
            setEditingContact(null);
        } catch (e) {
            toast.error(e.message || 'Failed to save contact');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const closeModals = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setFormData({ name: '', relation: '', mobile: '', email: '' });
        setEditingContact(null);
    };

    return (
        <div className="min-h-screen bg-gradient-subtle">
            {/* Header */}
            <div className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={onBack} className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">SOS Management</h1>
                                <p className="text-sm text-muted-foreground">
                                    Manage your emergency contacts ({contacts.length}/{maxContacts})
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleAddClick}
                            disabled={!canAddMore}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add SOS Contact
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Loading state */}
                {loading ? (
                    <div className="text-center py-16 text-muted-foreground">Loading contacts…</div>
                ) : contacts.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No SOS Contacts Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Add your emergency contacts to quickly reach them during urgent situations.
                        </p>
                        <Button
                            onClick={handleAddClick}
                            disabled={!canAddMore}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Contact
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contacts.map((contact) => (
                            <div
                                key={contact._id || contact.id}
                                className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-elegant transition-all duration-300 hover:scale-105 group"
                            >
                                {/* Contact Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground">{contact.name}</h3>
                                            <p className="text-sm text-muted-foreground">{contact.relation}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => handleEditContact(contact)}
                                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="Edit contact"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteContact(contact._id)}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                            title="Delete contact"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="space-y-3">
                                    {contact.mobile ? (
                                        <div className="flex items-center gap-3 text-sm">
                                            <Phone className="w-4 h-4 text-success" />
                                            <span className="text-foreground font-medium">{contact.mobile}</span>
                                        </div>
                                    ) : null}
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="w-4 h-4 text-primary" />
                                        <span className="text-muted-foreground">{contact.email}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={closeModals}>
                <DialogContent className="sm:max-w-md animate-scale-in">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditModalOpen ? 'Edit SOS Contact' : 'Add New SOS Contact'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditModalOpen
                                ? 'Update the contact information below.'
                                : 'Add a new emergency contact to your SOS list.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="relation">Relation *</Label>
                            <Input
                                id="relation"
                                value={formData.relation}
                                onChange={(e) => handleInputChange('relation', e.target.value)}
                                placeholder="e.g., Father, Mother, Brother, Friend"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input
                                id="mobile"
                                type="tel"
                                value={formData.mobile}
                                onChange={(e) => handleInputChange('mobile', e.target.value)}
                                placeholder="+1 234 567 8900"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={closeModals} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1">
                                {isEditModalOpen ? 'Update Contact' : 'Add Contact'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteContactId !== null} onOpenChange={() => setDeleteContactId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete SOS Contact</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this emergency contact? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Contact
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SOSManagement;