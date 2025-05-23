import { useEffect, useState } from "react";
import {
  MapPin,
  Calendar,
  Car,
  Fuel,
  Joystick,
  Armchair,
  ArrowLeft,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { appAuth } from "../utils/firebase";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import LoginPage from "../components/LoginPage"; // Import the LoginPage component
import { formatDate, toPascalCase } from "../utils/helperFunctions";
import { findPackage } from "../utils/mychoize";
import useTrackEvent from "../hooks/useTrackEvent";

const CarDetails = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { city } = useParams();
  const trackEvent = useTrackEvent();
  const { startDate, endDate, car, activeTab } = location.state || {};

  const startDateFormatted = formatDate(startDate);
  const endDateFormatted = formatDate(endDate);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // State to control modal visibility
  const [authUser, setAuthUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (authUser) {
      goToBooking(authUser);
    }
  }, [authUser]);
  useEffect(() => {
    document.title = title;
  }, [title]);

  // Automatic image scroller
  useEffect(() => {
    if (car?.images?.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % car.images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [car?.images]);

  const handleBooking = () => {
    handleCarBooking("Book");
    const user = appAuth.currentUser;
    console.log(user);
    if (!user) {
      setIsLoginModalOpen(true); // Open modal if not logged in
    } else {
      goToBooking(user);
    }
  };

  const goToBooking = (user) => {
    const userData = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      phone: user.phoneNumber,
    };
    navigate(
      `/self-drive-car-rentals/${city}/cars/booking-details/confirmation`,
      {
        state: {
          startDate,
          endDate,
          userData,
          car,
          activeTab,
        },
      }
    );
  };

  //ga for car booking
  const handleCarBooking = (label) => {
    trackEvent("Car Booking Section", "Rent Section Button Clicked", label);
  };

  const carDetails = [
    {
      name: `${car.brand} ${car.name}`,
      image: car?.images || [],
      rating: car.ratingData.rating,
      features: [
        {
          icon: <Armchair className="m-2 w-8 h-8" />,
          label: "Seats",
          value: car.options[2],
        },
        {
          icon: <Car className="m-2 w-8 h-8" />,
          label: "Trips",
          value: car.trips,
        },
        {
          icon: <Fuel className="m-2 w-9 h-9" />,
          label: "Fuel Type",
          value: car.options[1],
        },
        {
          icon: <Joystick className="m-2 w-8 h-8" />,
          label: "Transmission",
          value: car.options[0],
        },
      ],
      bookingInfo: {
        city: toPascalCase(city),
        startDate: startDateFormatted,
        endDate: endDateFormatted,
        driveType: "Self Drive",
        logo: car.sourceImg,
      },
      specifications: [
        { label: "Car Brand", value: car.brand },
        { label: "Car Name", value: car.name },
        {
          label: "Hourly Amount",
          value:
            car.source === "mychoize"
              ? `₹${car.hourly_amount}/hr`
              : car.hourly_amount,
        },
        { label: "Seats", value: car.options[2] },
        { label: "Fuel Type", value: car.options[1] },
        { label: "Transmission", value: car.options[0] },
        {
          label: "Package",
          value:
            activeTab === "subscribe"
              ? "Subscription"
              : car.source === "zoomcar"
              ? "Unlimited KMs"
              : findPackage(car.rateBasis),
        },
        {
          label: "Available KMs",
          value:
            car.source === "zoomcar"
              ? "Unlimited KMs"
              : activeTab === "subscribe" && car.source === "mychoize"
              ? " 3600 KMs"
              : car.total_km[car.rateBasis],
        },

        {
          label: "Extra KM Charge",
          value: car.rateBasis === "DR" ? "No Charge" : car.extrakm_charge,
        },
      ],
      price: car.fare,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Booking Details for {city} | Zymo</title>
        <meta
          name="description"
          content={`Review your booking details for a self-drive car rental in ${city} before confirming your reservation.`}
        />
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content="Ensure all details are correct before completing your car rental booking."
        />
        <link
          rel="canonical"
          href={`https://zymo.app/self-drive-car-rentals/${city}/cars/booking-details`}
        />
      </Helmet>
      <div>
        <button
          onClick={() => {
            sessionStorage.setItem("fromSearch", false);
            navigate(-1);
          }}
          className=" text-white m-3 mt-5 cursor-pointer"
        >
          <ArrowLeft size={25} />
        </button>
        <div className="min-h-screen bg-darkGrey text-white p-10 md:p-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
            {carDetails.map((car, index) => (
              <>
                {/* Left Section */}
                <div key={`left-${index}`}>
                  {/* Left Section - Image Scroller */}
                  <div>
                    {/* <div className="img-container relative w-full overflow-hidden rounded-2xl">
                                    <div
                                        className="img-scroller inline-flex transition-transform duration-700 ease-in-out"
                                        style={{
                                            width: `${car.image.length * 100}%`,
                                            transform: `translateX(-${(currentIndex * 100) / car.image.length}%)`,
                                        }}
                                    >
                                        {car.image.map((image, idx) => (
                                            <img
                                                key={idx}
                                                src={image}
                                                alt={`${car.name} ${idx + 1}`}
                                                className="w-full flex-none rounded-2xl shadow-xl"
                                                style={{ width: `${100 / car.image.length}%` }}
                                            />
                                        ))}
                                    </div>
                                </div> */}
                    <div className="img-container relative w-full overflow-hidden rounded-2xl">
                      {/* Backward Button */}
                      <button
                        className="absolute left-0 top-1/2 transform -translate-y-1/2  bg-black bg-opacity-25 text-[#faffa4] p-2 rounded-full z-10"
                        onClick={() => {
                          setCurrentIndex((prevIndex) =>
                            prevIndex === 0
                              ? car.image.length - 1
                              : prevIndex - 1
                          );
                        }}
                      >
                        &#10094; {/* Left arrow */}
                      </button>

                      {/* Image Scroller */}
                      <div
                        className="img-scroller inline-flex transition-transform duration-700 ease-in-out"
                        style={{
                          width: `${car.image.length * 100}%`,
                          transform: `translateX(-${
                            (currentIndex * 100) / car.image.length
                          }%)`,
                        }}
                      >
                        {car.image.map((image, idx) => (
                          <img
                            loading="lazy"
                            key={idx}
                            src={image}
                            alt={`${car.name} ${idx + 1}`}
                            className="w-full flex-none rounded-2xl shadow-xl"
                            style={{
                              width: `${100 / car.image.length}%`,
                            }}
                          />
                        ))}
                      </div>

                      {/* Forward Button */}
                      <button
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-25 text-[#faffa4] p-2 rounded-full z-10"
                        onClick={() => {
                          setCurrentIndex((prevIndex) =>
                            prevIndex === car.image.length - 1
                              ? 0
                              : prevIndex + 1
                          );
                        }}
                      >
                        &#10095; {/* Right arrow */}
                      </button>
                    </div>

                    {/* Booking Information */}
                    {/* <div className="bg-darkGrey2 mt-10 p-7 rounded-xl shadow-md mb-8 hidden lg:block"> */}
                    {/* Booking Info Content */}
                    {/* </div> */}
                  </div>

                  {/* Booking Information */}
                  <div className="bg-darkGrey2 mt-10 p-7 rounded-xl shadow-md mb-8 hidden lg:block">
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <Calendar />
                          <p className="text-gray-400">Start Date</p>
                        </div>
                        <p>{car.bookingInfo.startDate}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <MapPin />
                          <p className="text-gray-400">City</p>
                        </div>
                        <p>{car.bookingInfo.city}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <Calendar />
                          <p className="text-gray-400">End Date</p>
                        </div>
                        <p>{car.bookingInfo.endDate}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <p className="text-gray-400">Drive Type</p>
                      <div className="flex items-center">
                        <img
                          loading="lazy"
                          src={car.bookingInfo.logo}
                          alt="Zoomcar Logo"
                          className="h-6"
                        />
                        <span className="ml-2">
                          {car.bookingInfo.driveType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section */}
                <div key={`right-${index}`}>
                  <h1 className="text-4xl font-bold mb-4">{car.name}</h1>
                  <div className="flex items-center gap-2 text-appColor mb-6">
                    <span className="text-xl font-semibold">
                      ★ {car.rating}{" "}
                    </span>
                  </div>

                  {/* Key Features */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {car.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="bg-darkGrey2 rounded-xl p-4 gap-2 shadow-lg flex"
                      >
                        {feature.icon}
                        <div>
                          <p className="text-sm text-gray-400">
                            {feature.label}
                          </p>
                          <p className="text-xl font-semibold">
                            {feature.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Specifications */}
                  <h2 className="text-2xl font-bold mb-4">Specifications</h2>
                  <ul className="space-y-2">
                    {car.specifications.map((spec, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span className="text-gray-400">{spec.label}</span>
                        <span>{spec.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ))}
          </div>

          {/* Price and Booking */}
          <div className="mt-10 flex items-center justify-between lg:flex-col lg:space-y-4 lg:justify-center">
            <p className="text-3xl font-semibold text-appColor">
              {carDetails[0].price}
            </p>
            <span className="text-sm text-gray-400">
              {car.source === "zoomcar" ? "GST Included" : "GST Not Included"}
            </span>
            <button
              onClick={handleBooking}
              className="bg-appColor lg:w-48 text-black px-6 py-3 rounded-xl font-bold shadow-lg duration-300 ease-in-out transform hover:scale-110"
            >
              Book
            </button>
          </div>
        </div>

        {/* Login Modal */}
        <LoginPage
          onAuth={setAuthUser}
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </div>
    </>
  );
};

export default CarDetails;
