import React from "react";
import { FaUserPlus, FaHeartbeat, FaUserMd, FaBook } from "react-icons/fa";

const Works = () => {

  const steps = [
    {
      icon: <FaUserPlus />,
      title: "Create Account",
      desc: "Sign up and add your baby's information and health details."
    },
    {
      icon: <FaHeartbeat />,
      title: "Track Health",
      desc: "Monitor your baby's growth and vaccination schedules."
    },
    {
      icon: <FaUserMd />,
      title: "Consult Doctors",
      desc: "Connect with pediatricians for expert advice anytime."
    },
    {
      icon: <FaBook />,
      title: "Learn Newborn Care",
      desc: "Explore educational resources and parenting guidance."
    }
  ];

  return (
    <section className="works-section py-5" id="works">

      <div className="container">

        <div className="text-center mb-5">
          <h2 className="fw-bold">How It Works</h2>
          <p className="text-muted">
            Follow these simple steps to manage your newborn's health easily.
          </p>
        </div>

        <div className="row g-4 text-center align-items-stretch">

          {steps.map((step, index) => (

            <div className="col-sm-6 col-xl-3 d-flex" key={index}>

              <div className="work-card p-4">

                <div className="work-icon">
                  {step.icon}
                </div>

                <h5 className="mt-3">{step.title}</h5>

                <p className="text-muted">
                  {step.desc}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
};

export default Works;
