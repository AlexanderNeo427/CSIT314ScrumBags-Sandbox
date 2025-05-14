import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import LogoutModal from '../../components/LogoutModal'
import logo from '../../assets/logo.png'

const ViewServiceCategoryPage: React.FC = () => {
  const sessionUser = localStorage.getItem('sessionUser') || 'defaultUser'
  const [services, setServices] = useState<string[]>([])
  const [search, setSearch] = useState<string>('')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [createServiceCategoryModal, setCreateServiceCategoryModal] = useState(false)
  const [deleteServiceCategoryModal, setDeleteServiceCategoryModal] = useState(false)
  const [updateServiceCategoryModal, setUpdateServiceCategoryModal] = useState(false)  // Added for update modal
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [newServiceCategory, setNewServiceCategory] = useState<{ serviceName: string }>({
    serviceName: ''
  })
  const [updateServiceCategory, setUpdateServiceCategory] = useState<{ serviceName: string }>({
    serviceName: ''
  }) // Added for update category

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/Services/categories', {
          withCredentials: true,
        })

        const data: string[] = response.data
        console.log("Fetched services:", data)

        if (Array.isArray(data)) {
          setServices(data)
        } else {
          console.error('Unexpected server response:', data)
        }
      } catch (err) {
        console.error('Failed to fetch services:', err)
      }
    }

    fetchServices()
  }, [])

  const handleDelete = async () => {
    if (!selectedService) return
    try {
      console.log(selectedService)
      await axios.delete(`http://localhost:3000/api/services/categories`, {
        withCredentials: true,
        data: { category: selectedService },
      })
      alert(`Service category '${selectedService}' deleted successfully.`)
      setServices(services.filter(service => service !== selectedService))
      setDeleteServiceCategoryModal(false)
    } catch (err) {
      console.error('Failed to delete service category:', err)
      alert('Failed to delete service category. See console for details.')
    }
  }

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (search.trim() === '') {
        try {
          const response = await axios.get('http://localhost:3000/api/services/categories', {
            withCredentials: true,
          })
          setServices(response.data)
        } catch (err) {
          console.error('Failed to reload categories:', err)
        }
        return
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/services/categories/search?search=${search}`, {
          withCredentials: true,
        })
        if (response.data.length > 0) {
          setServices([response.data])
        } else {
          setServices([])
        }
      } catch (err) {
        console.error('Search failed:', err)
        setServices([])
      }
    }
  }

  return (
    <div className="page-container">
      {/* Navbar */}
      <div className="header-container">
        <div>
          <img src={logo} alt="Logo" height={40} />
          <h2><Link to="/platformManager-dashboard">Home</Link></h2>
          <h2><Link to="/ViewServiceCategories">Service Categories</Link></h2>
          <h2><Link to="/platformManager-view-report">Report</Link></h2>
        </div>

        <div>
          <h2 id="logout_button" onClick={() => setShowLogoutModal(true)} style={{ cursor: 'pointer' }}>
            <span style={{ marginRight: '8px' }}>👤</span>{sessionUser}/Logout
          </h2>
        </div>
      </div>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />

      {/* Create Category Modal */}
      {createServiceCategoryModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Service Category</h2>
            <label>Category Name:</label>
            <input
              id="categoryInput"
              type="text"
              placeholder="e.g. Floor cleaning"
              value={newServiceCategory.serviceName}
              onChange={(e) => setNewServiceCategory({ ...newServiceCategory, serviceName: e.target.value })}
            />
            <div className="modal-buttons">
              <button onClick={() => setCreateServiceCategoryModal(false)}>Cancel</button>
              <button onClick={async () => {
                try {
                  if (newServiceCategory.serviceName == '') {
                    alert('Failed to create service category.')
                  } else {
                    const response = await fetch('http://localhost:3000/api/services/categories', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ category: newServiceCategory.serviceName }),
                      credentials: 'include',
                    })

                    if (!response.ok) {
                      const errorData = await response.json()
                      throw new Error(errorData.message || 'Failed to create service category')
                    }

                    setCreateServiceCategoryModal(false)
                    setNewServiceCategory({ serviceName: '' })
                    window.location.reload()
                  }
                } catch (error) {
                  console.error('Error creating service category:', error)
                  alert('Failed to create service category.')
                }
              }}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Category Modal */}
      {updateServiceCategoryModal && selectedService && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Update Service Category</h2>
            <p>Updating: <strong>{selectedService}</strong></p> {/* Displaying the category name being updated */}
            <label>New Category Name:</label>
            <input
              type="text"
              value={updateServiceCategory.serviceName}  // Empty for now
              onChange={(e) => setUpdateServiceCategory({ serviceName: e.target.value })}
              placeholder="Enter new category name"
            />
            <div className="modal-buttons">
              <button onClick={() => setUpdateServiceCategoryModal(false)}>Cancel</button>
              <button onClick={async () => {
                try {
                  if (updateServiceCategory.serviceName == "") {
                    alert("Please fill in this field")
                  } else {
                    const response = await axios.put('http://localhost:3000/api/services/categories', {
                      category: selectedService,
                      newCategory: updateServiceCategory.serviceName
                    }, { withCredentials: true })

                    if (response.status === 200) {
                      alert(`Service category '${selectedService}' updated successfully.`)
                      setServices(services.map(service =>
                        service === selectedService ? updateServiceCategory.serviceName : service
                      ))
                      setUpdateServiceCategoryModal(false)
                    }
                    setUpdateServiceCategory({ serviceName: "" })
                  }


                } catch (error) {
                  console.error('Error updating service category:', error)
                  alert('Failed to update service category.')
                }
              }}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteServiceCategoryModal && selectedService && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Are you sure you want to delete "{selectedService}"?</h2>
            <div className="modal-buttons">
              <button onClick={() => setDeleteServiceCategoryModal(false)}>Cancel</button>
              <button onClick={handleDelete} className="delete-btn">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="body-container">
        <div className="card">
          <h2>List of Service Categories</h2>
          <div className="top-bar">
            <input
              type="text"
              className="search-bar"
              placeholder="Search by category name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
            />
            <button className="create-btn" onClick={() => setCreateServiceCategoryModal(true)}>Create New Category</button>
          </div>

          <table>
            <thead>
              <tr>
                <th >Category</th>
                <th id="actionCol">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.length > 0 ? (
                services.map((service, index) => (
                  <tr key={index}>
                    <td>{service}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setSelectedService(service)
                            setUpdateServiceCategory({ serviceName: '' })  // Empty the input field
                            setUpdateServiceCategoryModal(true)
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => {
                            setSelectedService(service)
                            setDeleteServiceCategoryModal(true)
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2}>No services available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-container">
        <b>© Copyright 2025 Easy & Breezy - All Rights Reserved</b>
      </div>
    </div>
  )
}

export default ViewServiceCategoryPage
