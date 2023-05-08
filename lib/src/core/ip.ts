/**
 * Vendored and pruned from node "OS" module dependency version of
 * @see https://github.com/indutny/node-ip
 */

import { Buffer } from "buffer";

const ipv4Regex = /^(\d{1,3}\.){3,3}\d{1,3}$/;
const ipv6Regex =
  /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i;

function _normalizeFamily(family?: string | number) {
  if (family === 4) {
    return "ipv4";
  }
  if (family === 6) {
    return "ipv6";
  }
  return family ? `${family}`.toLowerCase() : "ipv4";
}

const ip = {
  isV4Format: function (ip: string) {
    return ipv4Regex.test(ip);
  },
  toBuffer: function (ip: string, buff?: Buffer, offset: number = 0) {
    offset = ~~offset;

    let result;

    if (this.isV4Format(ip)) {
      result = buff || Buffer.alloc(offset + 4);
      ip.split(/\./g).map((byte: string) => {
        result[offset++] = parseInt(byte, 10) & 0xff;
      });
    } else if (this.isV6Format(ip)) {
      const sections = ip.split(":", 8);

      let i;
      for (i = 0; i < sections.length; i++) {
        const isv4 = this.isV4Format(sections[i]);
        let v4Buffer;

        if (isv4) {
          v4Buffer = this.toBuffer(sections[i]);
          sections[i] = v4Buffer.slice(0, 2).toString("hex");
        }

        if (v4Buffer && ++i < 8) {
          sections.splice(i, 0, v4Buffer.slice(2, 4).toString("hex"));
        }
      }

      if (sections[0] === "") {
        while (sections.length < 8) sections.unshift("0");
      } else if (sections[sections.length - 1] === "") {
        while (sections.length < 8) sections.push("0");
      } else if (sections.length < 8) {
        for (i = 0; i < sections.length && sections[i] !== ""; i++);
        const argv: [number, number] = [i, 1];
        for (i = 9 - sections.length; i > 0; i--) {
          // @ts-expect-error
          argv.push("0");
        }
        sections.splice(...argv);
      }

      result = buff || Buffer.alloc(offset + 16);
      for (i = 0; i < sections.length; i++) {
        const word = parseInt(sections[i], 16);
        result[offset++] = (word >> 8) & 0xff;
        result[offset++] = word & 0xff;
      }
    }

    if (!result) {
      throw Error(`Invalid ip address: ${ip}`);
    }

    return result;
  },
  isV6Format: function (ip: string) {
    return ipv6Regex.test(ip);
  },
  toLong: function (ip: string) {
    let ipl = 0;
    ip.split(".").forEach((octet: string) => {
      ipl <<= 8;
      ipl += parseInt(octet);
    });
    return ipl >>> 0;
  },

  fromLong: function (ipl: number) {
    return `${ipl >>> 24}.${(ipl >> 16) & 255}.${(ipl >> 8) & 255}.${
      ipl & 255
    }`;
  },

  subnet: function (addr: any, mask: any) {
    const networkAddress = ip.toLong(ip.mask(addr, mask));

    // Calculate the mask's length.
    const maskBuffer = ip.toBuffer(mask);
    let maskLength = 0;

    for (let i = 0; i < maskBuffer.length; i++) {
      if (maskBuffer[i] === 0xff) {
        maskLength += 8;
      } else {
        let octet = maskBuffer[i] & 0xff;
        while (octet) {
          octet = (octet << 1) & 0xff;
          maskLength++;
        }
      }
    }

    const numberOfAddresses = 2 ** (32 - maskLength);

    return {
      networkAddress: ip.fromLong(networkAddress),
      firstAddress:
        numberOfAddresses <= 2
          ? ip.fromLong(networkAddress)
          : ip.fromLong(networkAddress + 1),
      lastAddress:
        numberOfAddresses <= 2
          ? ip.fromLong(networkAddress + numberOfAddresses - 1)
          : ip.fromLong(networkAddress + numberOfAddresses - 2),
      broadcastAddress: ip.fromLong(networkAddress + numberOfAddresses - 1),
      subnetMask: mask,
      subnetMaskLength: maskLength,
      numHosts:
        numberOfAddresses <= 2 ? numberOfAddresses : numberOfAddresses - 2,
      length: numberOfAddresses,
      contains(other: string) {
        return networkAddress === ip.toLong(ip.mask(other, mask));
      },
    };
  },
  toString: function (buff: any, offset?: number, length?: number) {
    offset = ~~(offset || 0);
    length = length || buff.length - offset;

    let result = [];
    if (length === 4) {
      // IPv4
      for (let i = 0; i < length; i++) {
        result.push(buff[offset + i]);
      }
      // @ts-expect-error
      result = result.join(".");
    } else if (length === 16) {
      // IPv6
      for (let i = 0; i < length; i += 2) {
        result.push(buff.readUInt16BE(offset + i).toString(16));
      }
      // @ts-expect-error
      result = result.join(":");
      // @ts-expect-error
      result = result.replace(/(^|:)0(:0)*:0(:|$)/, "$1::$3");
      result = result.replace(/:{3,4}/, "::");
    }

    return result;
  },

  fromPrefixLen: function (prefixlen: number, family?: string) {
    if (prefixlen > 32) {
      family = "ipv6";
    } else {
      family = _normalizeFamily(family);
    }

    let len = 4;
    if (family === "ipv6") {
      len = 16;
    }
    const buff = Buffer.alloc(len);

    for (let i = 0, n = buff.length; i < n; ++i) {
      let bits = 8;
      if (prefixlen < 8) {
        bits = prefixlen;
      }
      prefixlen -= bits;

      buff[i] = ~(0xff >> bits) & 0xff;
    }

    return ip.toString(buff);
  },

  cidrSubnet: function (cidrString: string) {
    const cidrParts = cidrString.split("/");

    const addr = cidrParts[0];
    if (cidrParts.length !== 2) {
      throw new Error(`invalid CIDR subnet: ${addr}`);
    }

    const mask = ip.fromPrefixLen(parseInt(cidrParts[1], 10));

    return ip.subnet(addr, mask);
  },

  mask: function (addrA: string, maskA: string) {
    const addr = ip.toBuffer(addrA);
    const mask = ip.toBuffer(maskA);

    const result = Buffer.alloc(Math.max(addr.length, mask.length));

    // Same protocol - do bitwise and
    let i;
    if (addr.length === mask.length) {
      for (i = 0; i < addr.length; i++) {
        result[i] = addr[i] & mask[i];
      }
    } else if (mask.length === 4) {
      // IPv6 address and IPv4 mask
      // (Mask low bits)
      for (i = 0; i < mask.length; i++) {
        result[i] = addr[addr.length - 4 + i] & mask[i];
      }
    } else {
      // IPv6 mask and IPv4 addr
      for (i = 0; i < result.length - 6; i++) {
        result[i] = 0;
      }

      // ::ffff:ipv4
      result[10] = 0xff;
      result[11] = 0xff;
      for (i = 0; i < addr.length; i++) {
        result[i + 12] = addr[i] & mask[i + 12];
      }
      i += 12;
    }
    for (; i < result.length; i++) {
      result[i] = 0;
    }

    return ip.toString(result);
  },
};

export default ip;
