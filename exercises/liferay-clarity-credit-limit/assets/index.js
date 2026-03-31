import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Icons, UI, calculateChartData } from './DesignSystem';


const h = React.createElement;

// ==========================================
// 1. DATA LAYER (API HELPERS)
// ==========================================

const api = async (url) => {
  const baseUrl = window.location.origin || '';
  const authToken = window.Liferay?.authToken || '';
  return fetch(`${baseUrl}/${url}`, {
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': authToken }
  });
};

/**
 * Retrieves the Account details (ERC and Name) by calling the Liferay Headless Commerce API
 * using the accountId found in the Liferay.CommerceContext.
 */
const fetchAccountDetails = async () => {
  try {
    const accountId = window.Liferay?.CommerceContext?.account?.accountId;
    
    if (!accountId) {
      console.warn('Account ID not found in Liferay.CommerceContext');
      return { erc: 'BEAUMONT', name: 'Beaumont Optics Ltd' };
    }

    const response = await api(`o/headless-commerce-admin-account/v1.0/accounts/${accountId}`);
    
    if (!response.ok) throw new Error('Failed to fetch account details');
    
    const accountData = await response.json();
    return {
      erc: accountData.externalReferenceCode || 'BEAUMONT',
      name: accountData.name || 'Account'
    };
  } catch (error) {
    console.error('Error retrieving Account details:', error);
    return { erc: 'BEAUMONT', name: 'Beaumont Optics Ltd' };
  }
};

// ==========================================
// 2. BUSINESS LOGIC (MAIN APP COMPONENT)
// ==========================================

const App = () => {
  const [accountErc, setAccountErc] = useState(null);
  const [accountName, setAccountName] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const OBJECT_API_PATH = 'o/c/accountcreditlimits';

  // Step 1: Resolve the Account Details (ERC and Name) first
  useEffect(() => {
    const resolveAccount = async () => {
      const data = await fetchAccountDetails();
      setAccountErc(data.erc);
      setAccountName(data.name);
    };
    resolveAccount();
  }, []);

  // Log the accountErc for debugging
  useEffect(() => {
    if (accountErc) {
      console.log('Account ERC identified:', accountErc);
    }
  }, [accountErc]);

  const fetchCreditLimit = async () => {
    if (!accountErc) return;
    
    setLoading(true);
    setError(null);
    setHistory([]); // Clear existing history to avoid showing old chart data during transition
    
    try {
      if (!window.Liferay?.ThemeDisplay?.isSignedIn()) throw new Error("Please sign in.");
      
      // Fixed: Properly URL encode the filter string to handle spaces or special characters in the ERC
      const filterStr = encodeURIComponent(`r_accountToCredit_accountEntryERC  eq '${accountErc}'`);
      const response = await api(`${OBJECT_API_PATH}/?filter=${filterStr}&page=1&pageSize=10&sort=date:desc`);
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const result = await response.json();
      if (result.items && result.items.length > 0) {
        // Reverse to show chronological order in chart (oldest to newest)
        setHistory([...result.items].reverse());
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setHistory([]);
        setError(`No credit records found for account: ${accountErc}`);
      }
    } catch (err) {
      console.error('Fetch Credit Limit Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Fetch history once ERC is known
  useEffect(() => { 
    if (accountErc) {
      fetchCreditLimit(); 
    }
  }, [accountErc]);

  const chartData = useMemo(() => calculateChartData(history), [history]);
  const latest = history[history.length - 1];

  return h(UI.PageLayout, {
    header: h(UI.Header, { accountErc })
  },
    (!accountErc || loading) ? h(UI.LoadingState) 
    : error ? h(UI.ErrorState, { message: error })
    : latest ? h(UI.Dashboard, { 
        chartData, 
        hoveredIndex, 
        setHoveredIndex, 
        lastUpdated, 
        latest, 
        accountErc,
        accountName, 
        onRefresh: fetchCreditLimit,
        loading: loading
      })
    : h(UI.EmptyState)
  );
};

// --- Custom Element Registration ---
class CustomElement extends HTMLElement {
    connectedCallback() {
        ReactDOM.render(h(App), this);
    }
    disconnectedCallback() {
        ReactDOM.unmountComponentAtNode(this);
    }
}

const ELEMENT_NAME = 'liferay-clarity-credit-limit';
if (!customElements.get(ELEMENT_NAME)) {
    customElements.define(ELEMENT_NAME, CustomElement);
}

export default App;