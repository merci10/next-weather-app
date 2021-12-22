// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const url = req.query.url;

  if(typeof url === "string") {
    const response = await fetch(url).then(r => r.json())

    res.status(200).json(response)
  } else {
    res.status(400).json({message: "url must be string type."})
  }
}
