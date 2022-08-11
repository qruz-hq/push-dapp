import React, { useEffect,useState } from "react";
import { Item, Span, Section, Content, H2, H3 } from "primaries/SharedStyling";
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import { postReq } from "api";
import { useWeb3React } from "@web3-react/core";
import styled, { useTheme, css } from "styled-components";
import { useSelector } from "react-redux";
import RemoveDelegateModal from "./RemoveDelegateModal";
import DelegateInfo from "./DelegateInfo";

import {
  AiOutlineUserDelete
} from 'react-icons/ai';


const blockchainName = {
  1: "ETH_MAINNET",
  137: "POLYGON_MAINNET",
  42: "ETH_TEST_KOVAN",
  80001: "POLYGON_TEST_MUMBAI",
};

const isOnwer=(account,delegate)=>{
  return account.toLowerCase() !== delegate.toLowerCase() 
}

const ShowDelegates = () => {
  const { account, chainId } = useWeb3React();
  const [delegatees, setDelegatees] = React.useState([account]);
  const theme = useTheme();
  const [isActiveDelegateDropdown, setIsActiveDelegateDropdown] = React.useState(true);
  const [removeModalOpen, setRemoveModalOpen] = React.useState(false);
  const [delegateToBeRemoved, setDelegateToBeRemoved] = React.useState('');
  const { epnsCommWriteProvider } = useSelector(
    (state) => state.contracts
  );

  const removeDelegate = (walletAddress) => {
    return epnsCommWriteProvider.removeDelegate(walletAddress);
  };

  useEffect(()=>{
    fetchDelegatees()
  },[])

  const fetchDelegatees = async () => {
    try {
      const { data } = await postReq("/channels/getChannelDelegates", {
        channelAddress: account,
        blockchain: blockchainName[chainId]
      });

      if (data?.delegateAddress) {
        setDelegatees([account, ...data.delegateAddress]);
      }
    } catch (err) {
      console.error(err);
    }
  }
  
  return (
    <>
    <Section>
      <Content padding="20px 0px">
      <Item align="flex-start">
          <DelegatesInfoHeader style={{color : theme.color}}>Channel Delegates </DelegatesInfoHeader>
          <div style={{height:'4px'}}/>
          <DelegatesInfoLabel>
            Delegates that can send notifications on behalf of this channel.
          </DelegatesInfoLabel>
      </Item>
      </Content>
    </Section>
      <Item
        flex="5"
        minWidth="280px"
        align="stretch"
        margin="10px 0px 30px 0px"
        radius="10px"
        border="1px solid rgba(169, 169, 169, 0.5)"
      >
      {isActiveDelegateDropdown && delegatees && 
        <Item
          flex="5"
          justify="flex-start"
          align="stretch"
        >
          {delegatees.map((delegate,idx) => {
            return (
              <Item
                padding="12px"
                direction="row"
                justify="space-between"
                key={delegate}
                style={{
                  borderTop: idx !== 0 ? "1px solid rgba(169, 169, 169, 0.5)" : ""
                }}
              >
                <DelegateInfo delegateAddress={delegate} isDelegate={isOnwer(account,delegate)}/>
                {isOnwer(account,delegate) ?
                  <RemoveButton onClick={() => {
                    setDelegateToBeRemoved(delegate);
                    setRemoveModalOpen(true);
                  }}>
                  </RemoveButton> : 
                  <OwnerButton disabled={true}>
                    Channel Creator
                  </OwnerButton>
                }
              </Item>
            )
          })}
        </Item>
        }
        {removeModalOpen && (
          <RemoveDelegateModal
            onClose={() => {
              setRemoveModalOpen(false);
            }}
            onSuccess={() => setRemoveModalOpen(false)}
            removeDelegate={removeDelegate}
            address={delegateToBeRemoved}
          />
        )}
      </Item>
    </>
  )
}

const RemoveButton = ()=>{
  const [isHovered,setIsHovered] = useState(false)
  
  const handleMouseOver = () => {
    setIsHovered(true);
  };

  const handleMouseOut = () => {
    setIsHovered(false);
  };

  return(
      <RemoveButtonUI onMouseEnter={handleMouseOver} onMouseLeave={handleMouseOut}>
        {
        isHovered ?
        <div style={{display:'flex',width:'100%',alignItems: 'center',justifyContent: 'center'}}>
          <AiOutlineUserDelete fontSize={15}/>
          <div style={{padding:'3px'}}/>
          <div>
            Remove Delegate 
          </div>
        </div>
          :
            <div style={{color:"#657795",textAlign:'right',width:'100%'}}>
              Delegate
            </div>
        }
      </RemoveButtonUI>
  )
}

const ChannelActionButton = styled.button`
  border: 0;
  outline: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 15px;
  margin: 10px;
  color: #fff;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 400;
  position: relative;
  &:hover {
    opacity: 0.9;
    cursor: pointer;
    pointer: hand;
  }
  &:active {
    opacity: 0.75;
    cursor: pointer;
    pointer: hand;
  }
  ${(props) =>
    props.disabled &&
    css`
      &:hover {
        opacity: 1;
        cursor: default;
        pointer: default;
      }
      &:active {
        opacity: 1;
        cursor: default;
        pointer: default;
      }
    `}
`;

const RemoveButtonUI = styled(ChannelActionButton)`
  background: ${props => props.theme.backgroundBG};
  color: ${props => props.theme.color};
  height: 36px;
  max-width: 164px;
  flex:1; 
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 141%;
  display: flex;
  align-items: center;
  text-align: right;
  padding: 6px 10px 6px 9px;
  gap: 5px;
  
  &:hover {
    opacity: 0.9;
    background: #E93636;
    border-radius: 8px;
  };
    color: #fff;
    cursor: pointer;
  
`;

const OwnerButton = styled(ChannelActionButton)`
  /* background-color: red; */
  background: ${props => props.theme.backgroundBG};
  height: 50px;
  width: 164px;
  font-weight: 700;
  font-size: 15px;
  justify-content: end;
  text-align: right;
  cursor: pointer;
  color: #CF1C84;
  padding: 6px 10px 6px 9px;
`;


const DelegatesInfoHeader = styled.div`
font-family: 'Source Sans Pro';
font-style: normal;
font-weight: 700;
font-size: 20px;
line-height: 141%;
display: flex;
align-items: center;
color: ${(props) => props.theme.color};
`;
const DelegatesInfoLabel = styled.div`
  font-family: 'Source Sans Pro';
  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 150%;
  letter-spacing: 0.03em;
  color: #657795;
`;

export default ShowDelegates;