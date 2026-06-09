"""
bKash Payment Gateway Service (Tokenized Checkout)

This module provides functions to interact with the bKash Tokenized Checkout API.
bKash is the most widely used mobile financial service (MFS) in Bangladesh.

Flow:
1. Grant Token → get an access token
2. Create Payment → create a payment request, returns bkashURL for redirect
3. Query Payment → verify payment status after redirect
4. Refund (optional) → refund a completed payment

For sandbox testing, use the bKash Sandbox credentials provided by bKash.
Note: In sandbox mode, bKash provides test credentials (app_key, app_secret, username, password).
      For production, you need actual credentials from bKash merchant onboarding.
"""

import hashlib
import hmac
import time
import uuid
import requests
from django.conf import settings


def generate_tran_id():
    """Generate a unique transaction ID."""
    return f"BKASH_{int(time.time())}_{uuid.uuid4().hex[:8].upper()}"


def grant_token():
    """
    Grant a bKash access token.
    Returns: {'success': True, 'id_token': '...'} or {'success': False, 'error': '...'}
    """
    bkash_config = settings.BKASH
    api_urls = settings.BKASH_API['sandbox' if bkash_config['sandbox'] else 'production']
    base_url = api_urls['base']

    url = f"{base_url}{api_urls['grant_token']}"

    payload = {
        "app_key": bkash_config['app_key'],
        "app_secret": bkash_config['app_secret'],
    }

    headers = {
        "Content-Type": "application/json",
        "username": bkash_config['username'],
        "password": bkash_config['password'],
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        data = response.json()

        if data.get('statusCode') == '0000' or data.get('id_token'):
            return {
                'success': True,
                'id_token': data['id_token'],
            }
        else:
            return {
                'success': False,
                'error': data.get('statusMessage', 'Token grant failed'),
                'detail': data,
            }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': str(e),
        }


def create_payment(amount, transaction_id, customer_phone, payer_reference, intent='sale'):
    """
    Create a bKash payment request.
    Returns: {'success': True, 'bkashURL': '...', 'paymentID': '...', 'statusCode': '...'}
             or {'success': False, 'error': '...'}
    """
    bkash_config = settings.BKASH
    api_urls = settings.BKASH_API['sandbox' if bkash_config['sandbox'] else 'production']
    base_url = api_urls['base']

    # First grant a token
    token_result = grant_token()
    if not token_result['success']:
        return {
            'success': False,
            'error': f"Token grant failed: {token_result.get('error', 'Unknown error')}",
        }

    id_token = token_result['id_token']

    url = f"{base_url}{api_urls['create_payment']}"

    payload = {
        "amount": str(float(amount)),
        "currency": "BDT",
        "intent": intent,
        "merchantInvoiceNumber": transaction_id,
        "payerReference": payer_reference or customer_phone or "N/A",
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {id_token}",
        "X-APP-Key": bkash_config['app_key'],
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        data = response.json()

        if data.get('statusCode') == '0000' or data.get('bkashURL'):
            return {
                'success': True,
                'paymentID': data.get('paymentID', ''),
                'bkashURL': data.get('bkashURL', ''),
                'statusCode': data.get('statusCode', ''),
                'statusMessage': data.get('statusMessage', ''),
                'id_token': id_token,
            }
        else:
            return {
                'success': False,
                'error': data.get('statusMessage', 'Payment creation failed'),
                'detail': data,
            }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': str(e),
        }


def query_payment(payment_id, id_token):
    """
    Query the status of a bKash payment.
    Returns: {'success': True, 'data': {...}} or {'success': False, 'error': '...'}
    """
    bkash_config = settings.BKASH
    api_urls = settings.BKASH_API['sandbox' if bkash_config['sandbox'] else 'production']
    base_url = api_urls['base']

    url = f"{base_url}{api_urls['query_payment']}"

    payload = {
        "paymentID": payment_id,
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {id_token}",
        "X-APP-Key": bkash_config['app_key'],
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        data = response.json()

        if data.get('statusCode') == '0000' or data.get('transactionStatus') == 'Completed':
            return {
                'success': True,
                'data': data,
            }
        else:
            return {
                'success': False,
                'error': data.get('statusMessage', 'Payment query failed'),
                'detail': data,
            }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': str(e),
        }


def execute_payment(payment_id, id_token):
    """
    Execute a bKash payment after user authorization (for tokenized checkout).
    Returns: {'success': True, 'data': {...}} or {'success': False, 'error': '...'}
    """
    bkash_config = settings.BKASH
    api_urls = settings.BKASH_API['sandbox' if bkash_config['sandbox'] else 'production']
    base_url = api_urls['base']

    url = f"{base_url}/tokenized/checkout/execute"

    payload = {
        "paymentID": payment_id,
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {id_token}",
        "X-APP-Key": bkash_config['app_key'],
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        data = response.json()

        if data.get('statusCode') == '0000' or data.get('transactionStatus') == 'Completed':
            return {
                'success': True,
                'data': data,
            }
        else:
            return {
                'success': False,
                'error': data.get('statusMessage', 'Payment execution failed'),
                'detail': data,
            }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': str(e),
        }
