"""
SSLCommerz Payment Gateway Service

This module provides functions to interact with the SSLCommerz payment gateway API.
SSLCommerz is a leading payment gateway in Bangladesh supporting cards, mobile banking,
and internet banking.

Flow:
1. init_payment() → create a session and get a GatewayPageURL for redirect
2. verify_payment() → verify payment status via IPN validation
3. success/fail/cancel handling via callback URLs

For sandbox testing, use the SSLCommerz sandbox credentials.
      For production, use actual credentials from SSLCommerz merchant onboarding.
"""

import time
import uuid
import requests
from django.conf import settings


def _get_api_urls():
    """Get sandbox or production API URLs based on settings."""
    sslcommerz_config = getattr(settings, 'SSLCOMMERZ', {})
    sandbox = sslcommerz_config.get('sandbox', True)
    if sandbox:
        return {
            'base': 'https://sandbox.sslcommerz.com',
            'init_payment': '/gwprocess/v4/api.php',
            'verify_payment': '/validator/api/validationserverAPI.php',
        }
    else:
        return {
            'base': 'https://securepay.sslcommerz.com',
            'init_payment': '/gwprocess/v4/api.php',
            'verify_payment': '/validator/api/validationserverAPI.php',
        }


def _get_credentials():
    """Get SSLCommerz store credentials from Django settings."""
    sslcommerz_config = getattr(settings, 'SSLCOMMERZ', {})
    return {
        'store_id': sslcommerz_config.get('store_id', ''),
        'store_passwd': sslcommerz_config.get('store_passwd', ''),
    }


def generate_tran_id():
    """Generate a unique transaction ID."""
    return f"SSLCZ_{int(time.time())}_{uuid.uuid4().hex[:8].upper()}"


def init_payment(amount, transaction_id, customer_name, customer_email,
                 customer_phone, product_name='Medisoft Payment',
                 product_category='Healthcare', success_url='', fail_url='',
                 cancel_url='', ipn_url='', shipping_method='NO',
                 num_of_item=1):
    """
    Initialize an SSLCommerz payment session.
    
    Args:
        amount: Payment amount (float/int)
        transaction_id: Unique transaction ID
        customer_name: Customer full name
        customer_email: Customer email address
        customer_phone: Customer phone number
        product_name: Name of the product/service
        product_category: Category of the product
        success_url: URL to redirect after successful payment
        fail_url: URL to redirect after failed payment
        cancel_url: URL to redirect after cancelled payment
        ipn_url: Instant Payment Notification URL
        shipping_method: Shipping method (default: 'NO')
        num_of_item: Number of items
    
    Returns:
        dict with keys: success, sessionkey, GatewayPageURL, or error
    """
    creds = _get_credentials()
    api_urls = _get_api_urls()
    base_url = api_urls['base']

    url = f"{base_url}{api_urls['init_payment']}"

    payload = {
        'store_id': creds['store_id'],
        'store_passwd': creds['store_passwd'],
        'total_amount': str(float(amount)),
        'currency': 'BDT',
        'tran_id': transaction_id,
        'success_url': success_url,
        'fail_url': fail_url,
        'cancel_url': cancel_url,
        'ipn_url': ipn_url,
        'emi_option': 0,
        'cus_name': customer_name,
        'cus_email': customer_email,
        'cus_phone': customer_phone,
        'cus_add1': '',
        'cus_add2': '',
        'cus_city': '',
        'cus_state': '',
        'cus_postcode': '',
        'cus_country': 'Bangladesh',
        'cus_fax': '',
        'shipping_method': shipping_method,
        'num_of_item': str(num_of_item),
        'product_name': product_name,
        'product_category': product_category,
        'product_profile': 'general',
    }

    try:
        response = requests.post(url, data=payload, timeout=30)
        data = response.json()

        if data.get('status') == 'SUCCESS':
            return {
                'success': True,
                'sessionkey': data.get('sessionkey', ''),
                'GatewayPageURL': data.get('GatewayPageURL', ''),
                'redirectGatewayURL': data.get('redirectGatewayURL', ''),
                'redirectGatewayURLFailed': data.get('redirectGatewayURLFailed', ''),
                'redirectGatewayURLCancelled': data.get('redirectGatewayURLCancelled', ''),
            }
        else:
            return {
                'success': False,
                'error': data.get('failedreason', 'Payment initialization failed'),
                'detail': data,
            }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': str(e),
        }


def verify_payment(val_id):
    """
    Verify an SSLCommerz payment using the validation ID.
    
    Args:
        val_id: The validation ID received from SSLCommerz IPN
    
    Returns:
        dict with keys: success, data, or error
    """
    creds = _get_credentials()
    api_urls = _get_api_urls()
    base_url = api_urls['base']

    url = f"{base_url}{api_urls['verify_payment']}"

    payload = {
        'val_id': val_id,
        'store_id': creds['store_id'],
        'store_passwd': creds['store_passwd'],
    }

    try:
        response = requests.post(url, data=payload, timeout=30)
        data = response.json()

        if data.get('status') == 'VALID' or data.get('status') == 'VALIDATED':
            return {
                'success': True,
                'data': data,
            }
        elif data.get('status') == 'FAILED':
            return {
                'success': False,
                'error': 'Payment verification failed',
                'detail': data,
            }
        else:
            return {
                'success': False,
                'error': data.get('failedreason', 'Payment not valid'),
                'detail': data,
            }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': str(e),
        }
