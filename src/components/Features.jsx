import React from 'react'
import { FaSyringe, FaUserMd, FaChartLine, FaBook } from "react-icons/fa"
const Features = () => {
  const features = [
    {
      icon: <FaSyringe />,
      title: "Vaccination Tracking",
      desc: "Keep track of your baby's vaccination schedule and get reminders."
    },
    {
      icon: <FaUserMd />,
      title: "Pediatrician Consultation",
      desc: "Connect with experienced pediatricians for expert advice."
    },
    {
      icon: <FaChartLine />,
      title: "Health Records",
      desc: "Maintain digital records of your baby's growth and health history."
    },
    {
      icon: <FaBook />,
      title: "Parenting Guidance",
      desc: "Access useful tips and resources for newborn care."

    }
  ]
  return (
    <section className="features py-5" id="features">
      <div className="container text-center">
        <span className="section-kicker">Core tools</span>
        <h2 className="features-title">Everything parents check most often</h2>
        <p className="features-description">
          One place for the routines, reminders, and records that matter most in the first years.
        </p>
        <div className="row g-4 align-items-stretch">
          {features.map((feature, index) => (
            <div className="col-sm-6 col-xl-3 d-flex" key={index}>
              <div className="feature-card p-4 h-100">
                <div className="feature-icon mb-3">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
      
      

    </section>
  )
}

export default Features
