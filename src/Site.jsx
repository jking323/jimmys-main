import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Chalkboard from './components/Chalkboard.jsx';
import FirstTimer from './components/FirstTimer.jsx';
import Humidor from './components/Humidor.jsx';
import Events from './components/Events.jsx';
import PairingQuiz from './components/PairingQuiz.jsx';
import CigarOfTheMonth from './components/CigarOfTheMonth.jsx';
import Launches from './components/Launches.jsx';
import MonthlyLetter from './components/MonthlyLetter.jsx';
import Visit from './components/Visit.jsx';
import Footer from './components/Footer.jsx';

export default function Site() {
  return (
    <>
      <Nav />
      <Hero />
      <Chalkboard />
      <FirstTimer />
      <Humidor />
      <Events />
      <PairingQuiz />
      <CigarOfTheMonth />
      <Launches />
      <MonthlyLetter />
      <Visit />
      <Footer />
    </>
  );
}
