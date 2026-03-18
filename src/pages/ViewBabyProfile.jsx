import React, { useEffect, useState } from "react"

const ViewBabyProfile = () => {

  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem("babyProfile")

    if (saved) {
      setProfile(JSON.parse(saved))
    }
  }, [])

  if (!profile) {
    return (
      <div className="container py-4">
        <h3>No Baby Profile Found</h3>
        <p>Please create a profile first.</p>
      </div>
    )
  }

  return (
    <div className="container py-4">

      <h3>Baby Profile</h3>

      <div className="card p-4 shadow-sm mt-3">

        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>DOB:</strong> {profile.dob}</p>
        <p><strong>Gender:</strong> {profile.gender}</p>
        <p><strong>Weight:</strong> {profile.weight}</p>
        <p><strong>Height:</strong> {profile.height}</p>

      </div>

    </div>
  )
}

export default ViewBabyProfile