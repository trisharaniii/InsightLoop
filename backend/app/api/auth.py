import uuid
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.deps import get_current_user
from app.models.models import User, Workspace
from app.schemas.schemas import UserCreate, UserResponse, Token, LoginRequest

router = APIRouter(prefix="/auth", tags=["Auth & Workspace Isolation"])


@router.post("/signup", response_model=UserResponse)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new product team user with isolated workspace."""
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Create workspace for workspace isolation
    ws_name = getattr(user_in, "workspace_name", None) or "Default Workspace"
    workspace = Workspace(
        id=str(uuid.uuid4()),
        name=ws_name,
        description=f"Workspace for {user_in.full_name}"
    )
    db.add(workspace)
    db.commit()

    user = User(
        id=str(uuid.uuid4()),
        workspace_id=workspace.id,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "product_manager",
        avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_in.email}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT access token with workspace context."""
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "workspace_id": user.workspace_id or user.id,
            "role": user.role
        },
        expires_delta=timedelta(days=7)
    )
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    """Get profile of current logged in user."""
    return current_user
