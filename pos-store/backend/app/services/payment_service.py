from app.models.payment import Payment
from datetime import datetime

class PaymentService:
    def __init__(self, db_service):
        self.db = db_service

    def get_payment_methods(self, active_only=False, payment_type=None):
        methods = [
            {
                'id': 'cash',
                'name': 'Tiền mặt',
                'icon': 'cash',
                'active': True,
                'description': 'Thanh toán bằng tiền mặt',
                'min_amount': 0,
                'max_amount': None,
                'type': 'offline'
            },
            {
                'id': 'card',
                'name': 'Thẻ',
                'icon': 'credit-card',
                'active': True,
                'description': 'Thanh toán bằng thẻ ngân hàng',
                'min_amount': 2000,
                'max_amount': None,
                'type': 'offline'
            },
            {
                'id': 'transfer',
                'name': 'Chuyển khoản',
                'icon': 'bank',
                'active': True,
                'description': 'Chuyển khoản ngân hàng',
                'min_amount': 2000,
                'max_amount': None,
                'type': 'online'
            },
            {
                'id': 'momo',
                'name': 'Ví MoMo',
                'icon': 'wallet',
                'active': True,
                'description': 'Thanh toán qua ví MoMo',
                'min_amount': 1000,
                'max_amount': 50000000,
                'type': 'online'
            }
        ]

        # Lọc theo active
        if active_only:
            methods = [m for m in methods if m['active']]

        # Lọc theo type
        if payment_type:
            methods = [m for m in methods if m['id'] == payment_type]

        return methods

    def process_payment(self, order_number, data):
        try:
            order = self.db.orders.find_one({'order_number': order_number})
            if not order:
                return None

            payment = Payment(
                order_number=order_number,
                amount=float(data['amount']),
                method=data['method'],
                reference=data.get('reference')
            )

            # Xử lý thanh toán
            if payment.method == 'cash':
                payment.status = 'completed'
                payment.verified_at = datetime.utcnow()
            else:
                payment.status = 'pending'

            # Chuyển đổi ObjectId thành string trước khi trả về
            payment_dict = payment.to_dict()
            payment_dict['_id'] = str(payment_dict['_id'])
            payment_dict['created_at'] = payment_dict['created_at'].isoformat()
            payment_dict['updated_at'] = payment_dict['updated_at'].isoformat()
            if payment_dict.get('verified_at'):
                payment_dict['verified_at'] = payment_dict['verified_at'].isoformat()
            
            # Lưu vào database
            self.db.payments.insert_one(payment_dict)

            return payment_dict

        except Exception as e:
            print(f"Error processing payment: {str(e)}")
            return None

    def verify_payment(self, order_number, verification_data):
        try:
            # Tìm payment theo order_number
            payment = self.db.payments.find_one({'order_number': order_number})
            if not payment:
                return None

            if payment['status'] == 'completed':
                return {'message': 'Payment already completed'}

            # Xác thực theo phương thức thanh toán
            verified = False
            if payment['method'] == 'transfer':
                verified = self._verify_bank_transfer(payment['reference'], verification_data)
            elif payment['method'] == 'momo':
                verified = self._verify_momo_payment(payment['reference'], verification_data)

            if verified:
                # Cập nhật trạng thái payment
                current_time = datetime.utcnow()
                self.db.payments.update_one(
                    {'order_number': order_number},
                    {
                        '$set': {
                            'status': 'completed',
                            'verified_at': current_time,
                            'updated_at': current_time
                        }
                    }
                )

                # Cập nhật trạng thái order
                self.db.orders.update_one(
                    {'order_number': order_number},
                    {
                        '$set': {
                            'payment_status': 'paid',
                            'updated_at': current_time
                        }
                    }
                )

                return {
                    'order_number': order_number,
                    'payment_status': 'completed',
                    'verified_at': current_time.isoformat()
                }

            return {'message': 'Payment verification failed'}

        except Exception as e:
            print(f"Error verifying payment: {str(e)}")
            return None

    def refund_payment(self, order_number, refund_data):
        try:
            # Tìm payment theo order_number
            payment = self.db.payments.find_one({
                'order_number': order_number,
                'status': 'completed'
            })
            if not payment:
                return None

            # Tạo refund record
            refund = {
                'order_number': order_number,
                'payment_id': payment['_id'],
                'amount': float(refund_data.get('amount', payment['amount'])),
                'reason': refund_data.get('reason'),
                'method': payment['method'],
                'reference': refund_data.get('reference'),
                'status': 'pending',
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }

            # Xử lý theo phương thức thanh toán
            if payment['method'] == 'cash':
                refund['status'] = 'completed'
                refund['completed_at'] = datetime.utcnow()
                
                # Cập nhật trạng thái order
                self.db.orders.update_one(
                    {'order_number': order_number},
                    {
                        '$set': {
                            'payment_status': 'refunded',
                            'updated_at': datetime.utcnow()
                        }
                    }
                )
            
            # Lưu refund record
            self.db.refunds.insert_one(refund)
            
            # Format response
            refund['_id'] = str(refund['_id'])
            refund['payment_id'] = str(refund['payment_id'])
            refund['created_at'] = refund['created_at'].isoformat()
            refund['updated_at'] = refund['updated_at'].isoformat()
            if refund.get('completed_at'):
                refund['completed_at'] = refund['completed_at'].isoformat()

            return refund

        except Exception as e:
            print(f"Error processing refund: {str(e)}")
            return None

    def _update_order_payment_status(self, order_number: str):
        try:
            self.db.orders.update_one(
                {'order_number': order_number},
                {
                    '$set': {
                        'payment_status': 'paid',
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            return True
        except Exception as e:
            print(f"Error updating order payment status: {str(e)}")
            return False

    def _verify_bank_transfer(self, reference: str, verification_data: dict):
        # Implement bank transfer verification logic
        return True

    def _verify_momo_payment(self, reference: str, verification_data: dict):
        # Implement MoMo payment verification logic
        return True
