from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hash_roundtrip() -> None:
    encoded = hash_password("VeryStrongPassword123!")
    assert encoded != "VeryStrongPassword123!"
    assert verify_password("VeryStrongPassword123!", encoded)
    assert not verify_password("wrong-password", encoded)


def test_access_token_roundtrip() -> None:
    user_id = uuid4()
    token = create_access_token(user_id)
    payload = decode_token(token, "access")
    assert payload["sub"] == str(user_id)
    assert payload["type"] == "access"


def test_wrong_token_type_rejected() -> None:
    user_id = uuid4()
    token = create_access_token(user_id)
    with pytest.raises(HTTPException):
        decode_token(token, "refresh")
