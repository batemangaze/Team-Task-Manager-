from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from TTM.models import CurrentUser

SECRET_KEY="batemancorp"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_TIME=60

oauth2_scheme=OAuth2PasswordBearer(tokenUrl="/login")

def create_token(data:dict):
    to_encode=data.copy()
    expire=datetime.utcnow()+timedelta(minutes=ACCESS_TOKEN_EXPIRE_TIME)
    to_encode.update({"exp":expire})

    encoded_jwt=jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)

    return encoded_jwt

def get_current_user(token:str=Depends(oauth2_scheme)):

    try:
        payload=jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        user_id=payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401,detail="Could not validate credentials")
        
        return CurrentUser(user_id=user_id)
    except JWTError:
        raise HTTPException(status_code=401,detail="Could not validate credentials")
