from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserLogin, Token
from app.crud.user import (
    get_user_by_username,
    create_user,
    authenticate_user
)
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = get_user_by_username(db, user_in.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    user = create_user(
        db,
        username=user_in.username,
        password=user_in.password
    )

    token = create_access_token(subject=user.username)
    return {"access_token": token, "token_type": "bearer"}  

@router.post("/login", response_model=Token)
def login(
    user_in: UserLogin,
    db: Session = Depends(get_db)
):
    user = authenticate_user(
        db,
        user_in.username,
        user_in.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    token = create_access_token(subject=user.username)
    return {"access_token": token, "token_type": "bearer"}  