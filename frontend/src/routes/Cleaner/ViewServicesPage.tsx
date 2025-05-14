import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo.png'
import LogoutModal from '../../components/LogoutModal'

interface UserAccountResponse {
    id: number
    username: string
    userProfile: string
}
  
interface Service {
    id: number
    type: string
    description: string
    price: number
    status?: 'Active' | 'Deactivate'
}

interface NewServiceInput {
    serviceCategory: string
    serviceName: string
    description: string
    price: string
}

interface editServiceInput {
    serviceName: string,
    description: string,
    price: string
}

const ViewServicesPage: React.FC = () => {
    const sessionUser: UserAccountResponse = JSON.parse(localStorage.getItem('sessionObject') || '{}')

    // Variables
    const [services, setServices] = useState<Service[]>([]) // Array of services to display
    const [search, setSearch] = useState('') // Search for service input
    const [availableCategories, setAvailableCategories] = useState<string[]>([]) // List of category for Create New Services
    const [newService, setNewService] = useState<NewServiceInput>({
        serviceCategory: '',
        serviceName: '',
        description: '',
        price: ''
    })
    const [selectedServiceName, setSelectedServiceName] = useState<string | null>(null)
    const [selectedService, setSelectedService] = useState<number | null>(null)
    const [editService, setEditService] = useState<editServiceInput>({
        serviceName: '',
        description: '',
        price: ''
    })
    const [viewService, setViewService] = useState<Service | null>(null)
    const [viewCount, setViewCount] = useState('')
    const [shortlistCount, setShortlistCount] = useState('')


    // Popup modals
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [createServiceModal, setCreateServiceModal] = useState(false)
    const [deleteServiceProvidedModal, setDeleteServiceProvidedModal] = useState(false)
    const [updateServiceProvidedModal, setUpdateServiceProvidedModal] = useState(false)
    const [viewServiceModal, setViewServiceModal] = useState(false)

    // Fetch current services
    const fetchServices = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/services/${sessionUser.id}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                serviceName: search,
            }),
            })
            if (!response.ok) {
                throw new Error('Failed to fetch services')
            }
            const data = await response.json()
            const formatted: Service[] = data.map((item: any) => ({
                id: item.serviceProvidedID,
                type: item.serviceName,
                description: item.description,
                price: item.price,
            }))
            setServices(formatted)
        } catch (error) {
            console.error('Error fetching services:', error)
        }
    }

    useEffect(() => {
        fetchServices()
    }, [sessionUser.id]) // Only on mount or user ID change

    // Fetch available categories
    useEffect(() => {
        const fetchAvailableCategories = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/services/categories/')
            if (!response.ok) throw new Error('Failed to fetch available categories')
            const data = await response.json()
            console.log('Fetched available categories:', data)
            setAvailableCategories(data)
        } catch (error) {
            console.error('Error fetching available categories:', error)
        }
        }
        fetchAvailableCategories()
    }, [])

    const handleCreateService = async () => {
        try {
            console.log(newService)
            if(newService.serviceCategory == '' || newService.description == '' || newService.serviceName == '' || newService.price == ''){
                alert('Failed to create service.')
            } else {
                const response = await fetch('http://localhost:3000/api/services/me', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        service: newService.serviceName,
                        category: newService.serviceCategory,
                        description: newService.description,
                        price: Number(newService.price),
                    }),
                    credentials: 'include',
                })
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || 'Failed to create service')
                }
            
                setCreateServiceModal(false)
                setNewService({ serviceCategory:'', serviceName: '', description: '', price: '' })
                await fetchServices() // re-fetch without refreshing
            }
        } catch (error) {
                console.error('Error creating service:', error)
                alert('Failed to create service.')
            }
    }

    const handleDelete = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/services/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    serviceid: selectedService
                }),
                credentials: 'include',
            })
    
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to delete service')
            } else {
                alert("Service deleted successfully")
            }

            setDeleteServiceProvidedModal(false)
            await fetchServices()
        } catch (error) {
            console.error('Error deleting service: ', error)
            alert('Failed to delete service')
        }
    }

    const handleEdit = async() => {
        try{
            const response = await fetch('http://localhost:3000/api/services/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    serviceid: selectedService,
                    service: editService.serviceName,
                    description: editService.description,
                    price: Number(editService.price)
                }),
                credentials: 'include',
            })
    
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to edit service')
            } else {
                alert("Update successful")
            }

            setUpdateServiceProvidedModal(false)
            await fetchServices()
        } catch (error) {
            console.error('Error editing service: ', error)
            alert('Failed to edit service')
        }
    }

    // change this to run backend to retrieve view count and shortlist count
    const handleView = async (serviceID: number) => {
        try {
            const response = await fetch(`http://localhost:3000/api/services/views`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                serviceProvidedID: serviceID,
            }),
            })

            const response2 = await fetch(`http://localhost:3000/api/cleaners/shortlist/count`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                serviceProvidedID: serviceID,
            }),
            })

            if (!response.ok) {
                throw new Error('Failed to fetch services')
            }
            const data = await response.json()
            const data2 = await response2.json()
            
            setViewCount(data.toString())
            setShortlistCount(data2.toString())
        } catch (error) {
            console.error('Error fetching services:', error)
        }
    }

    return (
        <div className="page-container">
            <div className="header-container">
                <div>
                    <img src={logo} alt="Logo" height={40} />
                    <h2><Link to="/cleaner-dashboard">Home</Link></h2>
                    <h2><Link to="/cleaner-view-services">My Services</Link></h2>
                    <h2><Link to="/cleaner-view-bookings">My Bookings</Link></h2>
                </div>

                <div>
                    <h2 id="logout-button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
                    <span style={{ marginRight: '8px' }}>👤</span>{sessionUser.username}/Logout
                    </h2>
                </div>

            </div>
            
            <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

            {/* Create new services popup */}
            {createServiceModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Create New Service</h2>

                        <label>Service Category</label>
                        <select
                            id="categoryDropdown"
                            value={newService.serviceCategory}
                            onChange={(e) => setNewService({ ...newService, serviceCategory: e.target.value })}
                            required
                        >
                            <option value=''>Select a service</option>
                            {availableCategories.map((categoryName, index) => (
                                <option key={index} value={categoryName}>
                                    {categoryName}
                                </option>
                            ))}
                        </select>

                        <label>Type of Service</label>
                        <input 
                            type="text"
                            placeholder="e.g Sweep floor"
                            value={newService.serviceName}
                            onChange={(e) => setNewService({ ...newService, serviceName: e.target.value })}    
                            required
                        />

                        <label>Service Description</label>
                        <textarea
                            placeholder="e.g Sweep and mopping of floor"
                            value={newService.description}
                            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                            rows={4}
                            required
                        />

                        <label>Price</label>
                        <input
                            type="number"
                            placeholder="e.g 20"
                            min="0"
                            value={newService.price}
                            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                            required
                        />

                        <div className="modal-buttons">
                            <button onClick={() => setCreateServiceModal(false)}>Cancel</button>
                            <button onClick={handleCreateService}>Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteServiceProvidedModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Are you sure you want to delete "{selectedServiceName}"?</h2>
                        <div className="modal-buttons">
                            <button onClick={() => setDeleteServiceProvidedModal(false)}>Cancel</button>
                            <button onClick={handleDelete} className="delete-btn">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Service Modal */}
            {updateServiceProvidedModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Edit "{selectedServiceName}"?</h2>

                        <label>Updated Type of service</label>
                        <input 
                            type="text"
                            placeholder="e.g Sweep floor"
                            value={editService.serviceName}
                            onChange={(e) => setEditService({ ...editService, serviceName: e.target.value })}    
                        />

                        <label>Service Description</label>
                        <textarea
                            placeholder="e.g Sweep and mopping of floor"
                            value={editService.description}
                            onChange={(e) => setEditService({ ...editService, description: e.target.value })}
                            rows={4}
                        />

                        <label>Price</label>
                        <input
                            type="number"
                            placeholder="e.g 20"
                            min="0"
                            value={editService.price}
                            onChange={(e) => setEditService({ ...editService, price: e.target.value })}
                        />

                        <div className="modal-buttons">
                            <button onClick={() => setUpdateServiceProvidedModal(false)}>Cancel</button>
                            <button onClick={handleEdit} className="edit-btn">Edit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Service Modal */}
            {viewServiceModal && (
                <div className='modal-overlay'>
                    <div className='modal'>
                        <h3>Type of Service: {viewService?.type}</h3>
                        <h3>Description: {viewService?.description}</h3>
                        <h3>Price: {viewService?.price}</h3>

                        <h3>Number of views: {viewCount}</h3>
                        <h3>Number of shortlists: {shortlistCount}</h3>
                        
                        <div className="modal-buttons">
                            <button onClick={() => setViewServiceModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="body-container">
                <div className="card">
                    <h1>View Services</h1>

                    <div className="top-bar">
                        <input
                        type="text"
                        placeholder="🔍 Search...."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => {
                        if (e.key === 'Enter') fetchServices()
                        }}
                        />
                        <button className="search-btn" onClick={fetchServices}>Search</button>
                        <button className="create-btn" onClick={() => {
                            setNewService({ serviceCategory:'', serviceName: '', description: '', price: '' })
                            setCreateServiceModal(true)}}>Create New Services
                        </button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th><b>Type of Service</b></th>
                                <th>Price</th>
                                <th id='actionCol'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', padding: '1rem' }}>
                                        No service found.
                                    </td>
                                </tr>
                            ) : (
                                services.map((service, index) => (
                                    <tr key={service.id || index}>
                                        <td>{service.type}</td>
                                        <td>${service.price}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="view-btn"
                                                    onClick={async () => {
                                                        setSelectedServiceName(service.type)
                                                        setSelectedService(service.id)
                                                        setViewService({
                                                            id: service.id,
                                                            type: service.type,
                                                            description: service.description,
                                                            price: service.price
                                                        })
                                                        await handleView(service.id)
                                                        setViewServiceModal(true)
                                                    }}>
                                                    View
                                                </button>
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => {
                                                        setSelectedServiceName(service.type)
                                                        setSelectedService(service.id)
                                                        setEditService({
                                                            serviceName: service.type,
                                                            description: service.description,
                                                            price: service.price.toString(),
                                                        })
                                                        setUpdateServiceProvidedModal(true)
                                                    }}>
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => {
                                                        setSelectedServiceName(service.type)
                                                        setSelectedService(service.id)
                                                        setDeleteServiceProvidedModal(true)
                                                    }}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            </div>

            <footer className="footer-container">
                © Copyright 2025 Easy & Breezy - All Rights Reserved
            </footer>
        </div>
    )
}

export default ViewServicesPage