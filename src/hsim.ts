import {
  Address,
  store
} from "@graphprotocol/graph-ts"

import {
  HSIM,
  HSIStart,
  HSITransfer,
  HSITokenize,
  HSIDetokenize,
  Transfer
} from "../generated/HSIM/HSIM"

import {
  HSI
} from "../generated/HSI/HSI"

import {
  Owner,
  HEXStake
} from "../generated/schema"

import {
  isGnosisSafe
} from "../src/utils"

export function handleHSIStart(event: HSIStart): void {
  let ownerId = event.params.staker.toHexString();
  let owner = Owner.load(ownerId);

  if (!owner) {
    owner = new Owner(ownerId);
    owner.isGnosisSafe = isGnosisSafe(event.params.staker);
    owner.hasMintedHdrn = false;
    owner.hasMintedMaxi = false;
    owner.hasMintedPlsd = false;
  }

  let hsi = HSI.bind(event.params.hsiAddress);
  let share = hsi.share();
  let stake = share.getStake();
  let stakeId = stake.stakeId.toHexString();

  let hexStake = HEXStake.load(stakeId);

  if (hexStake) {
    let oldOwner = Owner.load(hexStake.owner);
    hexStake.owner = ownerId;
    hexStake.isHdrnHsi = true;
    hexStake.hdrnHsiAddress = event.params.hsiAddress;

    owner.save();
    hexStake.save();

    if (oldOwner) {
      store.remove('Owner', oldOwner.id)
    }
  }
}

export function handleHSITransfer(event: HSITransfer): void {
  let ownerId = event.params.newStaker.toHexString();
  let owner = Owner.load(ownerId);

  if (!owner) {
    owner = new Owner(ownerId);
    owner.isGnosisSafe = isGnosisSafe(event.params.newStaker);
    owner.hasMintedHdrn = false;
    owner.hasMintedMaxi = false;
    owner.hasMintedPlsd = false;
  }

  let hsi = HSI.bind(event.params.hsiAddress);
  let share = hsi.share();
  let stake = share.getStake();
  let stakeId = stake.stakeId.toHexString();

  let hexStake = HEXStake.load(stakeId);

  if (hexStake) {
    hexStake.previousOwners ?
      hexStake.previousOwners!.push(hexStake.owner) :
      new Array < string > ().push(hexStake.owner);

    hexStake.owner = ownerId;

    owner.save();
    hexStake.save();
  }
}

export function handleHSITokenize(event: HSITokenize): void {
  let hsi = HSI.bind(event.params.hsiAddress);
  let share = hsi.share();
  let stake = share.getStake();
  let stakeId = stake.stakeId.toHexString();

  let hexStake = HEXStake.load(stakeId);

  if (hexStake) {
    hexStake.isHdrnHsiTokenized = true;
    hexStake.hdrnHsiTokenId = event.params.hsiTokenId;

    hexStake.save();
  }
}

export function handleHSIDetokenize(event: HSIDetokenize): void {
  let hsi = HSI.bind(event.params.hsiAddress);
  let share = hsi.share();
  let stake = share.getStake();
  let stakeId = stake.stakeId.toHexString();

  let hexStake = HEXStake.load(stakeId);

  if (hexStake) {
    hexStake.isHdrnHsiTokenized = false;
    hexStake.hdrnHsiTokenId = null;

    hexStake.save();
  }
}

export function handleTransfer(event: Transfer): void {
  let ownerId = event.params.to.toHexString();
  let owner = Owner.load(ownerId);

  if (!owner) {
    owner = new Owner(ownerId);
    owner.isGnosisSafe = isGnosisSafe(event.params.to);
    owner.hasMintedHdrn = false;
    owner.hasMintedMaxi = false;
    owner.hasMintedPlsd = false;
  }

  let hsim = HSIM.bind(Address.fromString("0x8BD3d1472A656e312E94fB1BbdD599B8C51D18e3"))
  let hsiAddress = hsim.hsiToken(event.params.tokenId);

  let hsi = HSI.bind(hsiAddress);
  let share = hsi.share();
  let stake = share.getStake();
  let stakeId = stake.stakeId.toHexString();

  let hexStake = HEXStake.load(stakeId);

  if (hexStake) {
    hexStake.previousOwners ?
      hexStake.previousOwners!.push(hexStake.owner) :
      new Array < string > ().push(hexStake.owner);

    hexStake.owner = ownerId;

    owner.save();
    hexStake.save();
  }
}