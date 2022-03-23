import React, {useEffect, useRef, useState} from 'react';
import { useClick, useClickAway } from 'react-use';
import styled ,  {useTheme} from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { addresses, abis } from "@project/contracts";
import Loader from 'react-loader-spinner';

import {Item, H2, H3, Span, Button, Input} from 'components/SharedStyling';

const ethers = require('ethers');

const minStakeFees = 50;

export default function EditChannelModal({
    onClose,onSuccess, channelDetails
}) {

    const themes = useTheme();
    console.log(themes);
    const { active, error, account, library, chainId } = useWeb3React();
    const modalRef = useRef(null);
    const [mainAdress, setMainAddress] = useState('');
    const [loading, setLoading] = useState('');
    const [channelName,setChannelName]=useState('');
    const [channelInfo,setChannelInfo]=useState('');
    const [channelCTA,setChannelCTA]=useState('');
    const [chainDetails, setChainDetails] = React.useState("");
    const [channelStakeFees, setChannelStakeFees] = React.useState(minStakeFees);


    useEffect(()=>{
        console.log("channelDetails",channelDetails);
        setChannelCTA(channelDetails.url);
        setChannelName(channelDetails.name);
        setChannelInfo(channelDetails.info);
    },[])

    // Form signer and contract connection
    useClickAway(modalRef, onClose);

    const editChannel=async()=>{
        setLoading('Loading');
        var blockchain = "";
        var chain_id = "";
        var address = "";

        const input = JSON.stringify({
        name: channelName,
        info: channelInfo,
        url: channelCTA,
        // icon: channelFile,
        blockchain: blockchain,
        chain_id: chain_id,
        address: address,
    });

    var signer = library.getSigner(account);
    let contract = new ethers.Contract(
        addresses.epnscore,
        abis.epnscore,
        signer
      );
  
    const ipfs = require("nano-ipfs-store").at("https://ipfs.infura.io:5001");
    const storagePointer = await ipfs.add(input);
    console.log("IPFS storagePointer:", storagePointer);

    const identity = "1+" + storagePointer; // IPFS Storage Type and HASH
    const identityBytes = ethers.utils.toUtf8Bytes(identity);
    const fees = ethers.utils.parseUnits(channelStakeFees.toString(), 18);
    const channelType = 2;   
    var anotherSendTxPromise = contract.updateChannelMeta(
      account,
      identityBytes,
      { gasLimit: 1000000 }
    );
    anotherSendTxPromise
    .then(async function (tx) {
      console.log(tx);
      console.log("Check: " + account);
      await library.waitForTransaction(tx.hash);
      setLoading("Successfully Edited");

      setTimeout(() => {
          window.location.reload();
      }, 2000);
  })
      .catch((err) => {
        console.log("Error --> %o", err);
        console.log({ err });
        setLoading("Error")
      });

    }

    return (
        <Overlay>
            <AliasModal ref={modalRef} background={themes}>
                <Item align="flex-start">
                    <H2 textTransform="uppercase" spacing="0.1em">
                    <Span weight="200">Edit </Span><Span bg="#674c9f" color="#fff" weight="600" padding="0px 8px">Channel</Span>
                    </H2>
                    <H3>Edit Channel.</H3>
                </Item>
                <Item align="flex-start">
                    <CustomInput
                        required
                        placeholder="Channel Name"
                        radius="4px"
                        padding="12px"
                        border="1px solid #674c9f"
                        bg="#fff"
                        value={channelName}
                        onChange={(e) => {setChannelName(e.target.value)}}
                    />
                </Item>
                <Item align="flex-start">
                    <CustomInput
                        required
                        placeholder="Channel Description"
                        radius="4px"
                        padding="12px"
                        border="1px solid #674c9f"
                        bg="#fff"
                        value={channelInfo}
                        onChange={(e) => {setChannelInfo(e.target.value)}}
                    />
                </Item>
                <Item align="flex-start">
                    <CustomInput
                        required
                        placeholder="Channel CTA"
                        radius="4px"
                        padding="12px"
                        border="1px solid #674c9f"
                        bg="#fff"
                        value={channelCTA}
                        onChange={(e) => {setChannelCTA(e.target.value)}}
                    />
                </Item>
                <Item margin="15px 0px 0px 0px" flex="1" self="stretch" align="stretch">
                    <Button
                        bg='#e20880'
                        color='#fff'
                        flex="1"
                        radius="0px"
                        padding="20px 10px"
                        onClick={e=>editChannel(e)}
                        // disabled={mainAdress.length !== 42}
                    >
                        { loading && <Loader
                            type="Oval"
                            color="#FFF"
                            height={16}
                            width={16}
                            />
                        }
                        <StyledInput
                            cursor="hand"
                            textTransform="uppercase"
                            color="#fff" weight="400"
                            size="0.8em" spacing="0.2em"
                            value={loading ? loading : "Edit"}
                        />
                    </Button>
                </Item>
            </AliasModal>
        </Overlay>
    )
}

const StyledInput = styled(Input)`
    width: 100%;
    text-align: center;
    caret-color: transparent;
`

const CustomInput = styled(Input)`
    box-sizing: border-box;
    width: 100%;
    margin: 20px 0px;
`;

const Overlay = styled.div`
    top: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.85);
    height: 100%;
    width: 100%;
    z-index: 1000;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-y: scroll;
`;

const AliasModal = styled.div`
    padding: 20px 30px;
    background: ${props => props.background.mainBg};
`;