import { useState, useEffect } from 'react';
import api from '../services/api';

const EmployeeForm = ({ employee, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: ''
    });
    const [teams, setTeams] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTeams();

        if (employee) {
            setFormData({
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email
            });
            setSelectedTeams(employee.teams?.map(t => t.id) || []);
        }
    }, [employee]);

    const fetchTeams = async () => {
        try {
            const response = await api.get('/teams');
            setTeams(response.data.teams);
        } catch (err) {
            console.error('Failed to load teams:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleTeamToggle = (teamId) => {
        setSelectedTeams(prev =>
            prev.includes(teamId)
                ? prev.filter(id => id !== teamId)
                : [...prev, teamId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (employee) {
                await api.put(`/employees/${employee.id}`, formData);

                await updateTeamAssignments();
            } else {
                const response = await api.post('/employees', formData);
                const newEmployeeId = response.data.employee.id;

                for (const teamId of selectedTeams) {
                    try {
                        await api.post(`/teams/${teamId}/assign`, { employeeId: newEmployeeId });
                    } catch (err) {
                        console.error('Failed to assign team:', err);
                    }
                }
            }

            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save employee');
        } finally {
            setLoading(false);
        }
    };

    const updateTeamAssignments = async () => {
        if (!employee) return;

        const currentTeamIds = employee.teams?.map(t => t.id) || [];
        const teamsToAdd = selectedTeams.filter(id => !currentTeamIds.includes(id));
        const teamsToRemove = currentTeamIds.filter(id => !selectedTeams.includes(id));

        for (const teamId of teamsToAdd) {
            try {
                await api.post(`/teams/${teamId}/assign`, { employeeId: employee.id });
            } catch (err) {
                console.error('Failed to assign team:', err);
            }
        }

        for (const teamId of teamsToRemove) {
            try {
                await api.delete(`/teams/${teamId}/unassign`, {
                    data: { employeeId: employee.id }
                });
            } catch (err) {
                console.error('Failed to unassign team:', err);
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">
                        {employee ? 'Edit Employee' : 'Add New Employee'}
                    </h3>
                    <button className="modal-close" onClick={onCancel}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-error">
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">First Name *</label>
                            <input
                                type="text"
                                name="first_name"
                                className="form-input"
                                placeholder="Enter first name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Last Name *</label>
                            <input
                                type="text"
                                name="last_name"
                                className="form-input"
                                placeholder="Enter last name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                placeholder="Enter email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {teams.length > 0 && (
                            <div className="form-group">
                                <label className="form-label">Assign to Teams</label>
                                <div style={{
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--spacing-sm)'
                                }}>
                                    {teams.map((team) => (
                                        <div key={team.id} className="form-checkbox">
                                            <input
                                                type="checkbox"
                                                id={`team-${team.id}`}
                                                checked={selectedTeams.includes(team.id)}
                                                onChange={() => handleTeamToggle(team.id)}
                                            />
                                            <label htmlFor={`team-${team.id}`} style={{ cursor: 'pointer', margin: 0 }}>
                                                {team.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : employee ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;
