import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout/Layout"
import Dashboard from "@/pages/Dashboard/Dashboard"
import Registration from "@/pages/Registration/Registration"
import Questionnaire from "@/pages/Questionnaire/Questionnaire"
import VitalsPage from "@/pages/Vitals/Vitals"
import AssessmentPage from "@/pages/Assessment/Assessment"
import ReferralList from "@/pages/Referral/ReferralList"
import Statistics from "@/pages/Statistics/Statistics"
import Education from "@/pages/Education/Education"
import Review from "@/pages/Review/Review"
import Archive from "@/pages/Archive/Archive"
import ScreeningDetail from "@/pages/ScreeningDetail/ScreeningDetail"
import { useAppStore } from "@/store/useAppStore"

function AppRoutes() {
  const initApp = useAppStore(state => state.initApp)

  useEffect(() => {
    initApp()
  }, [initApp])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/questionnaire/:id" element={<Questionnaire />} />
        <Route path="/vitals" element={<VitalsPage />} />
        <Route path="/vitals/:id" element={<VitalsPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/assessment/:id" element={<AssessmentPage />} />
        <Route path="/referral" element={<ReferralList />} />
        <Route path="/review" element={<Review />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/education" element={<Education />} />
        <Route path="/screening/:id" element={<ScreeningDetail />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}
